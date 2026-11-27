/** Paragraf çalışması için saf mantık: soru hazırlama, set seçme, puanlama. */
import { Rng, shuffle } from '../rng';
import { ParagraphQuestion, QuestionType, QUESTION_TYPES } from './types';

export interface PreparedQuestion {
  source: ParagraphQuestion;
  options: string[];
  correct: number;
}

/** Şık sayısını sınava göre ayarlar ve (uygunsa) şıkları karıştırır. */
export function prepareQuestion(q: ParagraphQuestion, optionCount: number, rng: Rng): PreparedQuestion {
  let items = q.options.map((text, i) => ({ text, right: i === q.correct }));
  if (items.length > optionCount) {
    const wrong = items.map((it, i) => ({ it, i })).filter((x) => !x.it.right);
    const drop = wrong[Math.floor(rng() * wrong.length)].i;
    items = items.filter((_, i) => i !== drop);
  }
  if (!q.fixedOrder) items = shuffle(rng, items);
  return { source: q, options: items.map((i) => i.text), correct: items.findIndex((i) => i.right) };
}

export interface Attempt {
  questionId: string;
  type: QuestionType;
  correct: boolean;
  durationMs: number;
}

/**
 * Set seçimi: hiç gösterilmemiş sorular bitmeden hiçbiri yinelenmez; hepsi gösterildiyse en eski
 * gösterilenden başlanır. Aynı sette farklı soru tipleri tercih edilir.
 */
export function pickFresh<T extends ParagraphQuestion & { shownAt: string | null }>(pool: T[], count: number, rng: Rng): T[] {
  const rest = shuffle(rng, pool).sort((a, b) => (a.shownAt ?? '').localeCompare(b.shownAt ?? ''));
  const chosen: T[] = [];
  while (chosen.length < count && rest.length > 0) {
    const tier = rest[0].shownAt ?? '';
    const open = rest.filter((q) => (q.shownAt ?? '') === tier);
    // Sette en az kullanılan tipten, o tipte de en çok yeni soru kalanından seçilir.
    const used = (type: QuestionType) => chosen.filter((c) => c.type === type).length;
    const left = (type: QuestionType) => open.filter((c) => c.type === type).length;
    const next = [...open].sort((a, b) => used(a.type) - used(b.type) || left(b.type) - left(a.type))[0];
    chosen.push(next);
    rest.splice(rest.indexOf(next), 1);
  }
  return chosen;
}

export interface Stats {
  total: number;
  correct: number;
  /** 0..1 */
  accuracy: number;
  avgSec: number | null;
}

export function stats(attempts: Attempt[]): Stats {
  const total = attempts.length;
  const correct = attempts.filter((a) => a.correct).length;
  return {
    total,
    correct,
    accuracy: total ? correct / total : 0,
    avgSec: total ? Math.round(attempts.reduce((s, a) => s + a.durationMs, 0) / total / 1000) : null,
  };
}

export function statsByType(attempts: Attempt[]): Record<QuestionType, Stats> {
  return Object.fromEntries(QUESTION_TYPES.map((type) => [type, stats(attempts.filter((a) => a.type === type))])) as Record<QuestionType, Stats>;
}

/** En az 2 denemesi olan tipler içinde doğruluğu en düşük olan; hepsi tam ise null. */
export function weakestType(attempts: Attempt[]): QuestionType | null {
  const by = statsByType(attempts);
  const candidates = QUESTION_TYPES.filter((t) => by[t].total >= 2 && by[t].accuracy < 1);
  if (!candidates.length) return null;
  return candidates.reduce((worst, t) => (by[t].accuracy < by[worst].accuracy ? t : worst));
}

export type Advice = 'accuracy' | 'speed' | 'great';

/** Önce doğruluk: %70 altında hız hedefi konmaz. */
export function advice(s: Stats, targetSec: number): Advice {
  if (s.accuracy < 0.7) return 'accuracy';
  return (s.avgSec ?? 0) > targetSec ? 'speed' : 'great';
}
