import type { SqlDb } from '../db/types';
import { MAX_PLAUSIBLE_WPM, MIN_PLAUSIBLE_WPM } from '../core/metrics';
import { EMPTY_STREAK, StreakState, registerActivity, effectiveStreak, goalProgress, shiftDate } from '../core/streak';

export interface DailyGoalRecord {
  date: string;
  targetMinutes: number;
  completedMinutes: number;
  progress: number;
}

export interface PerformancePoint {
  at: string;
  wpm: number;
  comprehension: number;
}

export interface ProgressSummary {
  wordsRead: number;
  exerciseSessions: number;
  completedLessons: number;
  totalLessons: number;
  testsTaken: number;
}

export interface ProgressRepository {
  /** Bugünün hedefini döner (yoksa varsayılan hedefle oluşturur). */
  getDailyGoal(date: string, targetMinutes: number): DailyGoalRecord;
  /** Bugüne dakika ekler ve seriyi günceller. */
  addActivity(date: string, minutes: number, targetMinutes: number): { goal: DailyGoalRecord; streak: StreakState };
  getStreak(today: string): { state: StreakState; current: number };
  /** Son `days` günün dakikaları (eskiden yeniye). Kayıt yoksa 0. */
  getRecentMinutes(endDate: string, days: number): { date: string; minutes: number }[];
  getPerformanceSeries(limit?: number): PerformancePoint[];
  getSummary(): ProgressSummary;
}

export function createProgressRepository(db: SqlDb): ProgressRepository {
  const readStreak = (): StreakState => {
    const row = db.getFirstSync<{
      current_streak: number;
      best_streak: number;
      last_active_date: string | null;
    }>('SELECT current_streak, best_streak, last_active_date FROM streaks WHERE id = 1');
    if (!row) return EMPTY_STREAK;
    return {
      currentStreak: row.current_streak,
      bestStreak: row.best_streak,
      lastActiveDate: row.last_active_date,
    };
  };

  const writeStreak = (s: StreakState) => {
    db.runSync(
      `INSERT INTO streaks (id, current_streak, best_streak, last_active_date) VALUES (1, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET current_streak = excluded.current_streak,
         best_streak = excluded.best_streak, last_active_date = excluded.last_active_date`,
      [s.currentStreak, s.bestStreak, s.lastActiveDate],
    );
  };

  const goalFor = (date: string): DailyGoalRecord => {
    const row = db.getFirstSync<{ date: string; target_minutes: number; completed_minutes: number }>(
      'SELECT date, target_minutes, completed_minutes FROM daily_goals WHERE date = ?',
      [date],
    );
    const targetMinutes = row?.target_minutes ?? 0;
    const completedMinutes = row?.completed_minutes ?? 0;
    return {
      date,
      targetMinutes,
      completedMinutes,
      progress: goalProgress(completedMinutes, targetMinutes),
    };
  };

  return {
    getDailyGoal(date, targetMinutes) {
      db.runSync(
        'INSERT OR IGNORE INTO daily_goals (date, target_minutes, completed_minutes) VALUES (?, ?, 0)',
        [date, targetMinutes],
      );
      return goalFor(date);
    },

    addActivity(date, minutes, targetMinutes) {
      db.withTransactionSync(() => {
        db.runSync(
          'INSERT OR IGNORE INTO daily_goals (date, target_minutes, completed_minutes) VALUES (?, ?, 0)',
          [date, targetMinutes],
        );
        db.runSync('UPDATE daily_goals SET completed_minutes = completed_minutes + ? WHERE date = ?', [
          Math.max(0, minutes),
          date,
        ]);
        writeStreak(registerActivity(readStreak(), date));
      });
      return { goal: goalFor(date), streak: readStreak() };
    },

    getRecentMinutes(endDate, days) {
      const out: { date: string; minutes: number }[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = shiftDate(endDate, -i);
        const row = db.getFirstSync<{ completed_minutes: number }>('SELECT completed_minutes FROM daily_goals WHERE date = ?', [d]);
        out.push({ date: d, minutes: row?.completed_minutes ?? 0 });
      }
      return out;
    },

    getStreak(today) {
      const state = readStreak();
      return { state, current: effectiveStreak(state, today) };
    },

    getPerformanceSeries(limit = 60) {
      // Yalnızca testler: Hızlı Oku'da metin ayarlanan hızda aktığı için orada kullanıcının hızı ölçülmez.
      const rows = db.getAllSync<{ at: string; wpm: number; comprehension: number }>(
        `SELECT started_at AS at, wpm, comprehension_rate AS comprehension FROM test_results
         WHERE flags = '' AND wpm BETWEEN ? AND ? ORDER BY started_at DESC, id DESC LIMIT ?`,
        [MIN_PLAUSIBLE_WPM, MAX_PLAUSIBLE_WPM, limit],
      );
      return rows.reverse();
    },

    getSummary() {
      const words = db.getFirstSync<{ n: number | null }>(
        `SELECT (SELECT COALESCE(SUM(word_count), 0) FROM reading_sessions)
              + (SELECT COALESCE(SUM(word_count), 0) FROM test_results) AS n`,
      );
      const exercises = db.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM exercise_sessions');
      const lessons = db.getFirstSync<{ total: number; done: number }>(
        `SELECT COUNT(*) AS total, COALESCE(SUM(is_completed), 0) AS done FROM course_lessons
         WHERE course_id = (SELECT MAX(id) FROM courses)`,
      );
      const tests = db.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM test_results');
      return {
        wordsRead: words?.n ?? 0,
        exerciseSessions: exercises?.n ?? 0,
        completedLessons: lessons?.done ?? 0,
        totalLessons: lessons?.total ?? 0,
        testsTaken: tests?.n ?? 0,
      };
    },
  };
}
