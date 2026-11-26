import type { SqlDb } from './types';
import { BUILTIN_TEXTS, LEVEL_TEST_KEY } from '../content/builtinTexts';
import { EXERCISES } from '../core/exercises/registry';
import { countWords } from '../core/metrics';

/**
 * Yerleşik içerik tohumlaması (idempotent): egzersiz tanımları, yerleşik metinler ve
 * her metne ait test/soruları. Tekrar çalıştırılabilir; mevcut kayıtları değiştirmez.
 */
export function seedBuiltins(db: SqlDb, now: () => string = () => new Date().toISOString()): void {
  db.withTransactionSync(() => {
    for (const ex of Object.values(EXERCISES)) {
      db.runSync(
        'INSERT OR IGNORE INTO exercises (key, name, description, difficulty_params_json) VALUES (?, ?, ?, ?)',
        [ex.key, ex.name, ex.description, JSON.stringify(ex.defaults)],
      );
    }

    const ts = now();
    // Daha önce yüklenmiş metinler tek sorguyla atlanır; açılış süresi metin sayısıyla uzamaz.
    const seeded = new Set(
      db
        .getAllSync<{ key: string }>(
          'SELECT key FROM library_texts l WHERE key IS NOT NULL AND EXISTS (SELECT 1 FROM tests t WHERE t.text_id = l.id)',
        )
        .map((r) => r.key),
    );
    for (const text of BUILTIN_TEXTS) {
      if (seeded.has(text.key)) continue;
      db.runSync(
        `INSERT OR IGNORE INTO library_texts (key, title, body, word_count, source, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'builtin', ?, ?)`,
        [text.key, text.title, text.body, countWords(text.body), ts, ts],
      );
      const row = db.getFirstSync<{ id: number }>('SELECT id FROM library_texts WHERE key = ?', [text.key]);
      if (!row) continue;

      const existingTest = db.getFirstSync<{ id: number }>('SELECT id FROM tests WHERE text_id = ?', [row.id]);
      if (existingTest) continue;

      const type = text.key === LEVEL_TEST_KEY ? 'level' : 'reading';
      const testRes = db.runSync('INSERT INTO tests (text_id, type, created_at) VALUES (?, ?, ?)', [row.id, type, ts]);
      text.questions.forEach((q, i) => {
        db.runSync(
          `INSERT INTO test_questions (test_id, position, question, options_json, correct_index)
           VALUES (?, ?, ?, ?, ?)`,
          [testRes.lastInsertRowId, i, q.question, JSON.stringify(q.options), q.correctIndex],
        );
      });
    }
  });
}
