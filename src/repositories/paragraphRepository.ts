import type { SqlDb } from '../db/types';
import type { Attempt } from '../core/exam/practice';
import type { QuestionType } from '../core/exam/types';

export interface ParagraphRepository {
  record(attempt: Attempt, createdAt?: string): void;
  /** Eskiden yeniye. */
  list(limit?: number): Attempt[];
}

export function createParagraphRepository(db: SqlDb): ParagraphRepository {
  return {
    record(a, createdAt = new Date().toISOString()) {
      db.runSync('INSERT INTO paragraph_attempts (question_id, type, correct, duration_ms, created_at) VALUES (?, ?, ?, ?, ?)', [
        a.questionId,
        a.type,
        a.correct ? 1 : 0,
        Math.round(a.durationMs),
        createdAt,
      ]);
    },
    list(limit = 500) {
      const rows = db.getAllSync<{ question_id: string; type: QuestionType; correct: number; duration_ms: number }>(
        'SELECT question_id, type, correct, duration_ms FROM paragraph_attempts ORDER BY id DESC LIMIT ?',
        [limit],
      );
      return rows.reverse().map((r) => ({ questionId: r.question_id, type: r.type, correct: r.correct === 1, durationMs: r.duration_ms }));
    },
  };
}
