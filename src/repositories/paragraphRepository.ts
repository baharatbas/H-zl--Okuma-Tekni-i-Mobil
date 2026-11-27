import type { SqlDb } from '../db/types';
import type { Attempt } from '../core/exam/practice';
import { pickFresh } from '../core/exam/practice';
import type { ParagraphQuestion, QuestionType } from '../core/exam/types';
import type { Rng } from '../core/rng';

export interface ParagraphRepository {
  record(attempt: Attempt, createdAt?: string): void;
  /** Eskiden yeniye. */
  list(limit?: number): Attempt[];
  /**
   * Günün setinde henüz cevaplanmamış sorular. Set o gün için bir kez oluşturulur;
   * daha önce gösterilmemiş sorular bitmeden hiçbir soru yinelenmez. Hepsi cevaplandıysa boş döner.
   */
  dailySet(date: string, count: number, rng: Rng): ParagraphQuestion[];
  /** Soru tipi çalışması için yeni sorular; seçilenler gösterilmiş sayılır. */
  practiceSet(type: QuestionType, count: number, rng: Rng): ParagraphQuestion[];
}

interface Row {
  id: string;
  type: QuestionType;
  passage: string;
  stem: string;
  options_json: string;
  correct: number;
  explanation: string;
  fixed_order: number;
  shown_at: string | null;
}

const toQuestion = (r: Row): ParagraphQuestion => ({
  id: r.id,
  type: r.type,
  passage: r.passage,
  stem: r.stem,
  options: JSON.parse(r.options_json) as string[],
  correct: r.correct,
  explanation: r.explanation,
  fixedOrder: r.fixed_order === 1,
});

const SELECT = `SELECT q.id, q.type, q.passage, q.stem, q.options_json, q.correct, q.explanation, q.fixed_order, s.shown_at
  FROM paragraph_questions q LEFT JOIN paragraph_shown s ON s.question_id = q.id`;

export function createParagraphRepository(db: SqlDb): ParagraphRepository {
  const markShown = (id: string) =>
    db.runSync(
      `INSERT INTO paragraph_shown (question_id, shown_at, times) VALUES (?, ?, 1)
       ON CONFLICT(question_id) DO UPDATE SET shown_at = excluded.shown_at, times = times + 1`,
      [id, new Date().toISOString()],
    );

  const select = (rows: Row[], count: number, rng: Rng) =>
    pickFresh(rows.map((r) => ({ ...toQuestion(r), shownAt: r.shown_at })), count, rng);

  return {
    record(a, createdAt = new Date().toISOString()) {
      db.runSync('INSERT INTO paragraph_attempts (question_id, type, correct, duration_ms, created_at) VALUES (?, ?, ?, ?, ?)', [
        a.questionId,
        a.type,
        a.correct ? 1 : 0,
        Math.round(a.durationMs),
        createdAt,
      ]);
      db.runSync('UPDATE daily_paragraph SET answered = 1 WHERE question_id = ?', [a.questionId]);
    },
    list(limit = 500) {
      const rows = db.getAllSync<{ question_id: string; type: QuestionType; correct: number; duration_ms: number }>(
        'SELECT question_id, type, correct, duration_ms FROM paragraph_attempts ORDER BY id DESC LIMIT ?',
        [limit],
      );
      return rows.reverse().map((r) => ({ questionId: r.question_id, type: r.type, correct: r.correct === 1, durationMs: r.duration_ms }));
    },
    dailySet(date, count, rng) {
      const stored = db.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM daily_paragraph WHERE date = ?', [date])!.n;
      if (stored === 0) {
        const chosen = select(db.getAllSync<Row>(SELECT), count, rng);
        db.withTransactionSync(() => {
          chosen.forEach((q, i) => {
            db.runSync('INSERT INTO daily_paragraph (date, position, question_id, answered) VALUES (?, ?, ?, 0)', [date, i, q.id]);
            markShown(q.id);
          });
        });
      }
      return db
        .getAllSync<Row>(`${SELECT} JOIN daily_paragraph d ON d.question_id = q.id WHERE d.date = ? AND d.answered = 0 ORDER BY d.position`, [date])
        .map(toQuestion);
    },
    practiceSet(type, count, rng) {
      const chosen = select(db.getAllSync<Row>(`${SELECT} WHERE q.type = ?`, [type]), count, rng);
      db.withTransactionSync(() => chosen.forEach((q) => markShown(q.id)));
      return chosen;
    },
  };
}
