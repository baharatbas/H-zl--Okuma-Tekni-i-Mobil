import type { SqlDb } from './types';
import { BUILTIN_TEXTS, LEVEL_TEST_KEY } from '../content/builtinTexts';
import { PARAGRAPH_QUESTIONS } from '../content/exam/questions';
import { EXERCISES } from '../core/exercises/registry';
import { countWords } from '../core/metrics';

/**
 * Yerleşik içerik tohumlaması (idempotent): egzersiz tanımları, yerleşik metinler ve
 * her metne ait test/soruları. Tekrar çalıştırılabilir; mevcut kayıtları değiştirmez.
 */
function insertQuestions(db: SqlDb, testId: number, questions: { question: string; options: string[]; correctIndex: number }[]): void {
  questions.forEach((q, i) => {
    db.runSync(
      `INSERT INTO test_questions (test_id, position, question, options_json, correct_index)
       VALUES (?, ?, ?, ?, ?)`,
      [testId, i, q.question, JSON.stringify(q.options), q.correctIndex],
    );
  });
}

export function seedBuiltins(db: SqlDb, now: () => string = () => new Date().toISOString()): void {
  db.withTransactionSync(() => {
    for (const ex of Object.values(EXERCISES)) {
      db.runSync(
        'INSERT OR IGNORE INTO exercises (key, name, description, difficulty_params_json) VALUES (?, ?, ?, ?)',
        [ex.key, ex.name, ex.description, JSON.stringify(ex.defaults)],
      );
    }

    const stored = db.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM paragraph_questions')?.n ?? 0;
    if (stored < PARAGRAPH_QUESTIONS.length) {
      for (const q of PARAGRAPH_QUESTIONS) {
        db.runSync(
          `INSERT OR IGNORE INTO paragraph_questions (id, type, passage, stem, options_json, correct, explanation, fixed_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [q.id, q.type, q.passage, q.stem, JSON.stringify(q.options), q.correct, q.explanation, q.fixedOrder ? 1 : 0],
        );
      }
    }

    const ts = now();
    for (const text of BUILTIN_TEXTS) {
      db.runSync(
        `INSERT OR IGNORE INTO library_texts (key, title, body, word_count, source, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'builtin', ?, ?)`,
        [text.key, text.title, text.body, countWords(text.body), ts, ts],
      );
      const row = db.getFirstSync<{ id: number }>('SELECT id FROM library_texts WHERE key = ?', [text.key]);
      if (!row) continue;

      const existingTest = db.getFirstSync<{ id: number }>('SELECT id FROM tests WHERE text_id = ?', [row.id]);
      if (existingTest) {
        // Soru sayısı değiştiyse (ör. ölçüm metinlerine eklenen sorular) yalnızca soruları yenilenir;
        // sonuç geçmişi test kimliğine bağlı olduğu için korunur.
        const have = db.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM test_questions WHERE test_id = ?', [existingTest.id])?.n ?? 0;
        if (have !== text.questions.length) {
          db.runSync('DELETE FROM test_questions WHERE test_id = ?', [existingTest.id]);
          insertQuestions(db, existingTest.id, text.questions);
        }
        continue;
      }

      const type = text.key === LEVEL_TEST_KEY ? 'level' : 'reading';
      const testRes = db.runSync('INSERT INTO tests (text_id, type, created_at) VALUES (?, ?, ?)', [row.id, type, ts]);
      insertQuestions(db, testRes.lastInsertRowId, text.questions);
    }
  });
}
