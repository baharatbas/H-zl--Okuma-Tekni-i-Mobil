/**
 * Seviye belirleme. Okuma hızı (WPM) ve anlama oranı birlikte değerlendirilir:
 * etkin hız = WPM × anlama oranı. Anlama oranı düşükse seviye bir kademe düşürülür.
 */
export type Level = 'beginner' | 'intermediate' | 'advanced';

export const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced'];

export const LEVEL_THRESHOLDS = {
  /** Etkin hız bu değerin altındaysa başlangıç. */
  beginnerMax: 160,
  /** Etkin hız bu değerin altındaysa orta, üstündeyse ileri. */
  intermediateMax: 280,
  /** Anlama oranı bu değerin altındaysa bir kademe düşürülür. */
  minComprehensionForPromotion: 0.7,
} as const;

export interface LevelParams {
  level: Level;
  /** Kurs hedef okuma hızı (WPM). */
  targetWpm: number;
  /** Egzersiz zorluk kademesi (1-5). */
  exerciseDifficulty: number;
  /** Hızlı Oku'da varsayılan kelime/dakika. */
  defaultReadingWpm: number;
}

export const LEVEL_PARAMS: Record<Level, LevelParams> = {
  beginner: { level: 'beginner', targetWpm: 200, exerciseDifficulty: 1, defaultReadingWpm: 180 },
  intermediate: { level: 'intermediate', targetWpm: 320, exerciseDifficulty: 3, defaultReadingWpm: 300 },
  advanced: { level: 'advanced', targetWpm: 450, exerciseDifficulty: 5, defaultReadingWpm: 420 },
};

export function determineLevel(wpm: number, comprehension: number): Level {
  const eff = wpm * comprehension;
  let level: Level;
  if (eff < LEVEL_THRESHOLDS.beginnerMax) level = 'beginner';
  else if (eff < LEVEL_THRESHOLDS.intermediateMax) level = 'intermediate';
  else level = 'advanced';

  // Anlama düşükse hız yüksek olsa bile seviye bir kademe düşer.
  if (comprehension < LEVEL_THRESHOLDS.minComprehensionForPromotion) {
    if (level === 'advanced') level = 'intermediate';
    else if (level === 'intermediate') level = 'beginner';
  }
  return level;
}

export function isLevel(value: unknown): value is Level {
  return value === 'beginner' || value === 'intermediate' || value === 'advanced';
}
