import type { SqlDb } from '../db/types';
import { buildDailyPlan, DailyKind, DailyTask } from '../core/dailyPlan';
import type { Level } from '../core/levels';
import { BUILTIN_TEXTS, LEVEL_TEST_KEY } from '../content/builtinTexts';
import { countWords } from '../core/metrics';
import { Segment, SEGMENTS } from '../core/segments';
import { categoryOf } from '../content/textCategories';

export interface DailyTaskRow extends DailyTask {
  completed: boolean;
}

export interface DailyRepository {
  /** Günün planını döner; yoksa o anki performansa göre oluşturup saklar. */
  getPlan(date: string, level: Level, segment?: Segment, minutes?: number): DailyTaskRow[];
  /** Hiç görevi tamamlanmamışsa günün planını siler (grup değişince yenisi üretilir). */
  reset(date: string): void;
  complete(date: string, position: number): void;
  totalXp(): number;
}

/** Grubun konularındaki metinler; yeterli metin yoksa tamamı. */
function preferred(segment: Segment) {
  const all = BUILTIN_TEXTS.filter((x) => x.key !== LEVEL_TEST_KEY);
  const wanted = SEGMENTS[segment].categories;
  const mine = all.filter((x) => wanted.includes(categoryOf({ key: x.key, source: 'builtin' })));
  return mine.length >= 6 ? mine : all;
}

export function createDailyRepository(db: SqlDb): DailyRepository {
  const read = (date: string) =>
    db
      .getAllSync<{ position: number; kind: DailyKind; ref: string; difficulty: number; minutes: number; xp: number; completed_at: string | null }>(
        'SELECT position, kind, ref, difficulty, minutes, xp, completed_at FROM daily_tasks WHERE date = ? ORDER BY position',
        [date],
      )
      .map(({ completed_at, ...row }) => ({ ...row, completed: completed_at !== null }));

  return {
    reset(date) {
      db.runSync('DELETE FROM daily_tasks WHERE date = ? AND NOT EXISTS (SELECT 1 FROM daily_tasks d WHERE d.date = ? AND d.completed_at IS NOT NULL)', [date, date]);
    },

    getPlan(date, level, segment = 'self', minutes = 10) {
      const existing = read(date);
      if (existing.length > 0) return existing;

      const history = db.getAllSync<{ key: string; difficulty: number; score: number }>(
        `SELECT e.key, s.difficulty, s.score FROM exercise_sessions s JOIN exercises e ON e.id = s.exercise_id
         ORDER BY s.started_at DESC, s.id DESC LIMIT 100`,
      );
      const comprehension = db.getFirstSync<{ c: number | null }>(
        'SELECT AVG(comprehension_rate) AS c FROM (SELECT comprehension_rate FROM test_results ORDER BY started_at DESC LIMIT 3)',
      )?.c;
      const seen = db.getAllSync<{ key: string }>(
        `SELECT l.key FROM library_texts l WHERE l.key IS NOT NULL AND (
           EXISTS (SELECT 1 FROM reading_sessions r WHERE r.text_id = l.id)
           OR EXISTS (SELECT 1 FROM tests t JOIN test_results x ON x.test_id = t.id WHERE t.text_id = l.id))`,
      );
      const previous = db.getAllSync<{ ref: string }>(
        'SELECT ref FROM daily_tasks WHERE date = (SELECT MAX(date) FROM daily_tasks WHERE date < ?)',
        [date],
      );
      const plan = buildDailyPlan({
        date,
        level,
        history,
        comprehension: comprehension ?? null,
        segment,
        minutes,
        texts: preferred(segment).map((x) => ({ key: x.key, words: countWords(x.body) })),
        seenTexts: seen.map((r) => r.key),
        previousRefs: previous.map((r) => r.ref),
      });
      db.withTransactionSync(() => {
        for (const task of plan) {
          db.runSync(
            'INSERT INTO daily_tasks (date, position, kind, ref, difficulty, minutes, xp) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [date, task.position, task.kind, task.ref, task.difficulty, task.minutes, task.xp],
          );
        }
      });
      return read(date);
    },

    complete(date, position) {
      db.runSync('UPDATE daily_tasks SET completed_at = ? WHERE date = ? AND position = ? AND completed_at IS NULL', [
        new Date().toISOString(),
        date,
        position,
      ]);
    },

    totalXp() {
      return db.getFirstSync<{ n: number }>('SELECT COALESCE(SUM(xp), 0) AS n FROM daily_tasks WHERE completed_at IS NOT NULL')?.n ?? 0;
    },
  };
}
