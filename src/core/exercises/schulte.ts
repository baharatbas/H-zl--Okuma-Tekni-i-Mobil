/**
 * Schulte Tablosu: karışık sayılara 1'den başlayarak sırayla dokunulur. Tablo bitince yenisi gelir;
 * süre dolunca oyun biter. Dikkat ve görsel tarama çalışmasıdır.
 */
import { Rng, shuffle } from '../rng';
import { clampDifficulty } from './types';

const SIZES = [3, 4, 5, 6, 6];
/** Sayı başına hedef süre (sn); tablo büyüdükçe artar. */
const TARGET_SEC: Record<number, number> = { 3: 1, 4: 1.3, 5: 1.6, 6: 2 };

export interface SchulteParams {
  level: number;
  size: number;
  durationMs: number;
  /** En üst seviyede her doğru dokunuştan sonra tablo yeniden karışır. */
  reshuffle: boolean;
}

export function schulteParams(difficulty: number, durationSec = 120): SchulteParams {
  const level = clampDifficulty(difficulty);
  return { level, size: SIZES[level - 1], durationMs: durationSec * 1000, reshuffle: level === 5 };
}

export function generateSchulteGrid(size: number, rng: Rng): number[] {
  return shuffle(rng, Array.from({ length: size * size }, (_, i) => i + 1));
}

export function summarizeSchulte(params: SchulteParams, hits: number, mistakes: number, playedMs: number) {
  const taps = hits + mistakes;
  const accuracy = taps ? hits / taps : 0;
  const avgMs = hits ? playedMs / hits : null;
  const pace = avgMs ? Math.min(1, (TARGET_SEC[params.size] * 1000) / avgMs) : 0;
  return {
    score: Math.round(100 * pace * accuracy),
    accuracy,
    avgResponseMs: avgMs === null ? null : Math.round(avgMs),
  };
}
