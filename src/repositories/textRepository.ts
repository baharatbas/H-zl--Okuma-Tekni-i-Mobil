import type { SqlDb } from '../db/types';
import { countWords } from '../core/metrics';
import type { TestOutcome } from "../core/testScoring";
import type { ReadingMode } from '../core/settings';

export interface LibraryText {
  id: number;
  key: string | null;
  title: string;
  body: string;
  wordCount: number;
  source: 'builtin' | 'user';
  createdAt: string;
  updatedAt: string;
}

/** Liste ekranı için hafif kayıt: metnin tamamı yerine kısa bir giriş taşır. */
export interface TextSummary {
  id: number;
  key: string | null;
  title: string;
  source: 'builtin' | 'user';
  wordCount: number;
  preview: string;
  questions: number;
}

export interface TestQuestion {
  id: number;
  position: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface TestRecord {
  id: number;
  textId: number;
  type: 'level' | 'reading' | 'custom';
  questions: TestQuestion[];
}

export interface ReadingSessionRecord {
  id: number;
  textId: number;
  startedAt: string;
  wpm: number;
  durationMs: number;
  wordCount: number;
  mode: ReadingMode | 'free';
}

export interface TextRepository {
  list(source?: 'builtin' | 'user'): LibraryText[];
  /** Tüm metinlerin özetleri, soru sayılarıyla birlikte tek sorguda. */
  listSummaries(): TextSummary[];
  get(id: number): LibraryText | null;
  getByKey(key: string): LibraryText | null;
  createUser(title: string, body: string): number;
  updateUser(id: number, title: string, body: string): void;
  deleteUser(id: number): void;
  /** Metne ait testi (yoksa oluşturur) ve sorularını döner. Soru yoksa null. */
  getTest(textId: number, type?: 'level' | 'reading' | 'custom'): TestRecord | null;
  /** Kullanıcının özel sorularını değiştirir (öncekiler silinir). */
  createCustomTest(textId: number, questions: Omit<TestQuestion, "id" | "position">[]): number;
  clearCustomTests(textId: number): void;
  recordTestResult(testId: number, outcome: TestOutcome, durationMs: number, startedAt?: string): void;
  recordReadingSession(textId: number, wpm: number, durationMs: number, wordCount: number, mode: string, startedAt?: string): void;
  listReadingSessions(limit?: number): ReadingSessionRecord[];
}

export function createTextRepository(db: SqlDb): TextRepository {
  const mapText = (r: {
    id: number;
    key: string | null;
    title: string;
    body: string;
    word_count: number;
    source: 'builtin' | 'user';
    created_at: string;
    updated_at: string;
  }): LibraryText => ({
    id: r.id,
    key: r.key,
    title: r.title,
    body: r.body,
    wordCount: r.word_count,
    source: r.source,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  });

  const TEXT_COLUMNS = 'id, key, title, body, word_count, source, created_at, updated_at';

  return {
    list(source) {
      const rows = db.getAllSync<any>(
        `SELECT ${TEXT_COLUMNS} FROM library_texts WHERE deleted_at IS NULL ${source ? 'AND source = ?' : ''} ORDER BY source DESC, created_at ASC`,
        source ? [source] : [],
      );
      return rows.map(mapText);
    },

    listSummaries() {
      return db.getAllSync<TextSummary>(
        `SELECT l.id, l.key, l.title, l.source, l.word_count AS wordCount, substr(l.body, 1, 200) AS preview,
           (SELECT COUNT(*) FROM test_questions q
             WHERE q.test_id = (SELECT t.id FROM tests t WHERE t.text_id = l.id ORDER BY t.id LIMIT 1)) AS questions
         FROM library_texts l
         WHERE l.deleted_at IS NULL
         ORDER BY l.source DESC, l.created_at ASC, l.id ASC`,
      );
    },

    get(id) {
      const row = db.getFirstSync<any>(`SELECT ${TEXT_COLUMNS} FROM library_texts WHERE id = ? AND deleted_at IS NULL`, [id]);
      return row ? mapText(row) : null;
    },

    getByKey(key) {
      const row = db.getFirstSync<any>(`SELECT ${TEXT_COLUMNS} FROM library_texts WHERE key = ?`, [key]);
      return row ? mapText(row) : null;
    },

    createUser(title, body) {
      const now = new Date().toISOString();
      const res = db.runSync(
        "INSERT INTO library_texts (key, title, body, word_count, source, created_at, updated_at) VALUES (NULL, ?, ?, ?, 'user', ?, ?)",
        [title.trim(), body.trim(), countWords(body), now, now],
      );
      return res.lastInsertRowId;
    },

    updateUser(id, title, body) {
      db.runSync(
        "UPDATE library_texts SET title = ?, body = ?, word_count = ?, updated_at = ? WHERE id = ? AND source = 'user'",
        [title.trim(), body.trim(), countWords(body), new Date().toISOString(), id],
      );
    },

    deleteUser(id) {
      // Yerleşik metinler silinemez; yalnızca kullanıcı metinleri.
      // Metin gizlenir; okuma ve test geçmişi (grafikler) korunur.
      db.runSync("UPDATE library_texts SET deleted_at = ? WHERE id = ? AND source = 'user'", [new Date().toISOString(), id]);
    },

    getTest(textId, type) {
      const test = db.getFirstSync<{ id: number; type: 'level' | 'reading' | 'custom' }>(
        `SELECT id, type FROM tests WHERE text_id = ? ${type ? 'AND type = ?' : ''} ORDER BY id LIMIT 1`,
        type ? [textId, type] : [textId],
      );
      if (!test) return null;
      const questions = db.getAllSync<any>(
        'SELECT id, position, question, options_json, correct_index FROM test_questions WHERE test_id = ? ORDER BY position',
        [test.id],
      );
      if (questions.length === 0) return null;
      return {
        id: test.id,
        textId,
        type: test.type,
        questions: questions.map((q) => ({
          id: q.id,
          position: q.position,
          question: q.question,
          options: JSON.parse(q.options_json) as string[],
          correctIndex: q.correct_index,
        })),
      };
    },

    createCustomTest(textId, questions) {
      let testId = 0;
      db.withTransactionSync(() => {
        // Test satırı korunur (sonuç geçmişi ona bağlı); yalnızca sorular yenilenir.
        const existing = db.getFirstSync<{ id: number }>("SELECT id FROM tests WHERE text_id = ? AND type = 'custom' ORDER BY id LIMIT 1", [textId]);
        testId =
          existing?.id ??
          db.runSync("INSERT INTO tests (text_id, type, created_at) VALUES (?, 'custom', ?)", [textId, new Date().toISOString()]).lastInsertRowId;
        db.runSync('DELETE FROM test_questions WHERE test_id = ?', [testId]);
        questions.forEach((q, i) => {
          db.runSync(
            'INSERT INTO test_questions (test_id, position, question, options_json, correct_index) VALUES (?, ?, ?, ?, ?)',
            [testId, i, q.question, JSON.stringify(q.options), q.correctIndex],
          );
        });
      });
      return testId;
    },

    clearCustomTests(textId) {
      db.runSync("DELETE FROM test_questions WHERE test_id IN (SELECT id FROM tests WHERE text_id = ? AND type = 'custom')", [textId]);
    },

    recordTestResult(testId, outcome, durationMs, startedAt = new Date().toISOString()) {
      db.runSync(
        `INSERT INTO test_results (test_id, started_at, correct_count, total_count, wpm, comprehension_rate, duration_ms, word_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          testId,
          startedAt,
          outcome.correctCount,
          outcome.totalCount,
          outcome.wpm,
          outcome.comprehension,
          Math.round(durationMs),
          outcome.wordCount,
        ],
      );
    },

    recordReadingSession(textId, wpm, durationMs, wordCount, mode, startedAt = new Date().toISOString()) {
      db.runSync(
        'INSERT INTO reading_sessions (text_id, started_at, wpm, duration_ms, word_count, mode) VALUES (?, ?, ?, ?, ?, ?)',
        [textId, startedAt, wpm, Math.round(durationMs), wordCount, mode],
      );
    },

    listReadingSessions(limit = 200) {
      const rows = db.getAllSync<any>(
        'SELECT id, text_id, started_at, wpm, duration_ms, word_count, mode FROM reading_sessions ORDER BY started_at DESC LIMIT ?',
        [limit],
      );
      return rows.map((r) => ({
        id: r.id,
        textId: r.text_id,
        startedAt: r.started_at,
        wpm: r.wpm,
        durationMs: r.duration_ms,
        wordCount: r.word_count,
        mode: r.mode,
      }));
    },
  };
}
