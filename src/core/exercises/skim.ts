/**
 * Hızlı Göz Gezdirme (skimming): metin kısa süre gösterilir, sonra ana fikir ve ayrıntı soruları sorulur.
 * Metnin tamamını kelime kelime okumadan anlamı yakalama becerisini çalıştırır.
 */
import { BUILTIN_TEXTS, BuiltinText } from '../../content/builtinTexts';
import { Rng } from '../rng';
import { clampDifficulty } from './types';

export interface SkimParams {
  showMs: number;
  questions: number;
}

export function skimParams(difficulty: number, showMs = 15000): SkimParams {
  return { showMs, questions: 3 };
}

/** Zorluk arttıkça daha uzun metin seçilir (kelime sayısına göre sıralı havuzdan). */
export function pickSkimText(difficulty: number, rng: Rng, pool: BuiltinText[] = BUILTIN_TEXTS): BuiltinText {
  const sorted = [...pool].sort((a, b) => a.body.length - b.body.length);
  const d = clampDifficulty(difficulty);
  const center = Math.round(((d - 1) / 4) * (sorted.length - 1));
  const spread = Math.max(1, Math.floor(sorted.length / 4));
  const lo = Math.max(0, center - spread);
  const hi = Math.min(sorted.length - 1, center + spread);
  const idx = lo + Math.floor(rng() * (hi - lo + 1));
  return sorted[idx];
}

export function summarizeSkim(correct: number, total: number) {
  return {
    correct,
    total,
    accuracy: total > 0 ? correct / total : 0,
    avgResponseMs: null as number | null,
    score: total > 0 ? Math.round((correct / total) * 100) : 0,
  };
}
