import type { SqlDb } from '../db/types';
import type { ExerciseKey, ExerciseResult } from '../core/exercises/types';

export interface ExerciseSessionRecord {
  id: number;
  key: ExerciseKey;
  startedAt: string;
  durationMs: number;
  score: number;
  accuracy: number;
  speedSetting: number;
  difficulty: number;
  avgResponseMs: number | null;
}

export interface ExerciseRepository {
  recordSession(
    key: ExerciseKey,
    result: ExerciseResult,
    settings: { speedMs: number; difficulty: number },
    startedAt?: string,
  ): number;
  listSessions(key?: ExerciseKey, limit?: number): ExerciseSessionRecord[];
  countSessions(): number;
}

export function createExerciseRepository(db: SqlDb): ExerciseRepository {
  return {
    recordSession(key, result, settings, startedAt = new Date().toISOString()) {
      const ex = db.getFirstSync<{ id: number }>('SELECT id FROM exercises WHERE key = ?', [key]);
      if (!ex) throw new Error(`Bilinmeyen egzersiz: ${key}`);
      const res = db.runSync(
        `INSERT INTO exercise_sessions
         (exercise_id, started_at, duration_ms, score, accuracy, speed_setting, difficulty, avg_response_ms)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ex.id,
          startedAt,
          Math.round(result.durationMs),
          Math.round(result.score),
          result.accuracy,
          Math.round(settings.speedMs),
          settings.difficulty,
          result.avgResponseMs === null ? null : Math.round(result.avgResponseMs),
        ],
      );
      return res.lastInsertRowId;
    },

    listSessions(key, limit = 100) {
      const rows = db.getAllSync<{
        id: number;
        key: ExerciseKey;
        started_at: string;
        duration_ms: number;
        score: number;
        accuracy: number;
        speed_setting: number;
        difficulty: number;
        avg_response_ms: number | null;
      }>(
        `SELECT s.id, e.key, s.started_at, s.duration_ms, s.score, s.accuracy, s.speed_setting, s.difficulty, s.avg_response_ms
         FROM exercise_sessions s JOIN exercises e ON e.id = s.exercise_id
         ${key ? 'WHERE e.key = ?' : ''}
         ORDER BY s.started_at DESC LIMIT ?`,
        key ? [key, limit] : [limit],
      );
      return rows.map((r) => ({
        id: r.id,
        key: r.key,
        startedAt: r.started_at,
        durationMs: r.duration_ms,
        score: r.score,
        accuracy: r.accuracy,
        speedSetting: r.speed_setting,
        difficulty: r.difficulty,
        avgResponseMs: r.avg_response_ms,
      }));
    },

    countSessions() {
      return db.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM exercise_sessions')?.n ?? 0;
    },
  };
}
