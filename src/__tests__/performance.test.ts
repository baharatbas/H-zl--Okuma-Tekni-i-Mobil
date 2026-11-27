/**
 * Büyük veri performansı: 30 bin egzersiz, 15 bin test sonucu ile okuma sorguları kısa sürede dönmeli.
 * Eşikler cihaz donanımına göre gevşek tutulur; asıl amaç büyüme ile birlikte kasmayı yakalamaktır.
 */
import { openMemoryDb } from './helpers/nodeSqlite';
import { migrate } from '../db/migrate';
import { seedBuiltins } from '../db/seed';
import { createCourseRepository } from '../repositories/courseRepository';
import { createExerciseRepository } from '../repositories/exerciseRepository';
import { createTextRepository } from '../repositories/textRepository';
import { createProgressRepository } from '../repositories/progressRepository';
import { createParagraphRepository } from '../repositories/paragraphRepository';
import { createDailyRepository } from '../repositories/dailyRepository';
import { createProfileRepository } from '../repositories/profileRepository';

describe('büyük veri performansı', () => {
  it('okuma sorguları büyük geçmişte hızlı kalır ve gerekli indeksler plan içindedir', () => {
    const db = openMemoryDb();
    migrate(db);
    seedBuiltins(db);
    createProfileRepository(db).saveSettings({ purpose: 'self' });
    const exercises = createExerciseRepository(db);
    const texts = createTextRepository(db);
    const progress = createProgressRepository(db);
    const paragraphs = createParagraphRepository(db);
    const daily = createDailyRepository(db);
    const course = createCourseRepository(db);
    const lessons = course.start('beginner').lessons;
    void lessons;

    const keys = db.getAllSync<{ id: number }>('SELECT id FROM exercises');
    const testIds = db.getAllSync<{ id: number }>('SELECT id FROM tests');
    const textIds = db.getAllSync<{ id: number }>('SELECT id FROM library_texts');
    const day = (i: number) => new Date(Date.UTC(2025, 0, 1) + i * 60_000).toISOString();

    db.withTransactionSync(() => {
      for (let i = 0; i < 30_000; i++) {
        db.runSync(
          'INSERT INTO exercise_sessions (exercise_id, started_at, duration_ms, score, accuracy, speed_setting, difficulty) VALUES (?, ?, 1000, ?, 0.8, 1000, 1)',
          [keys[i % keys.length].id, day(i), i % 100],
        );
      }
      for (let i = 0; i < 15_000; i++) {
        db.runSync(
          "INSERT INTO test_results (test_id, started_at, correct_count, total_count, wpm, comprehension_rate, duration_ms, word_count, flags) VALUES (?, ?, 2, 3, ?, 0.66, 30000, 90, '')",
          [testIds[i % testIds.length].id, day(i), 150 + (i % 200)],
        );
      }
      for (let i = 0; i < 10_000; i++) {
        db.runSync("INSERT INTO reading_sessions (text_id, started_at, wpm, duration_ms, word_count, mode) VALUES (?, ?, 200, 30000, 90, 'free')", [textIds[i % textIds.length].id, day(i)]);
      }
      for (let i = 0; i < 15_000; i++) {
        db.runSync("INSERT INTO paragraph_attempts (question_id, type, correct, duration_ms, created_at) VALUES ('main-1', 'main', ?, 40000, ?)", [i % 2, day(i)]);
      }
    });

    const timeMs = (f: () => unknown) => {
      const s = Date.now();
      f();
      return Date.now() - s;
    };
    const limit = 300;
    expect(timeMs(() => progress.getSummary())).toBeLessThan(limit);
    expect(timeMs(() => progress.getPerformanceSeries(30))).toBeLessThan(limit);
    expect(timeMs(() => exercises.listSessions(undefined, 500))).toBeLessThan(limit);
    expect(timeMs(() => exercises.bestScores())).toBeLessThan(limit);
    expect(timeMs(() => progress.getRecentMinutes('2026-11-27', 7))).toBeLessThan(limit);
    expect(timeMs(() => texts.listSummaries())).toBeLessThan(limit);
    expect(timeMs(() => paragraphs.list())).toBeLessThan(limit);
    expect(timeMs(() => course.getActive())).toBeLessThan(limit);
    expect(timeMs(() => daily.getPlan('2026-11-27', 'beginner', 'self', 10))).toBeLessThan(limit);

    const plan = (q: string) => db.getAllSync<{ detail: string }>(`EXPLAIN QUERY PLAN ${q}`).map((p) => p.detail).join(' | ');
    expect(plan('SELECT * FROM exercise_sessions ORDER BY started_at DESC LIMIT 20')).not.toContain('TEMP B-TREE');
  });
});
