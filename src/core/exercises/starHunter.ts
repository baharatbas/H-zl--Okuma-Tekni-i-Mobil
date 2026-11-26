/**
 * Yıldız Avcısı: kısa süreli renkli yıldızlar gösterilir, kullanıcı hedef renkteki yıldız sayısını girer.
 * Her turda bir hedef renk seçilir; diğer renkler dikkat dağıtıcıdır.
 * Yıldızlar başlangıç süresinden (varsayılan 800 ms) başlayarak tur ilerledikçe kısalır.
 */
import { Rng, pickOne, randomInt, shuffle } from '../rng';
import { clampDifficulty } from './types';

export const STAR_COLORS = [
  { key: 'red', name: 'kırmızı', hex: '#EF4444' },
  { key: 'blue', name: 'mavi', hex: '#3B82F6' },
  { key: 'green', name: 'yeşil', hex: '#22C55E' },
  { key: 'yellow', name: 'sarı', hex: '#EAB308' },
  { key: 'purple', name: 'mor', hex: '#A855F7' },
  { key: 'teal', name: 'turkuaz', hex: '#14B8A6' },
] as const;

export type StarColorKey = (typeof STAR_COLORS)[number]['key'];

export interface StarHunterParams {
  rounds: number;
  colorCount: number;
  maxStars: number;
  startMs: number;
  minMs: number;
  stepMs: number;
}

/** Zorluk ve hız ayarına göre parametre seti. startMs = hız ayarı (ör. 800). */
export function starHunterParams(difficulty: number, startMs = 800): StarHunterParams {
  const d = clampDifficulty(difficulty);
  return {
    rounds: 4 + d * 2,
    colorCount: Math.min(STAR_COLORS.length, 1 + d),
    maxStars: Math.min(14, 4 + d * 2),
    startMs,
    minMs: 250,
    stepMs: 30 + d * 10,
  };
}

export interface Star {
  color: StarColorKey;
  /** 0..1 aralığında normalize konum (4x4 ızgara hücresine yerleşir, üst üste binmez). */
  x: number;
  y: number;
}

export interface StarRound {
  index: number;
  targetColor: StarColorKey;
  palette: StarColorKey[];
  stars: Star[];
  targetCount: number;
  displayMs: number;
}

/** Tur `index` (0'dan başlar) için gösterim süresi (ms). */
export function displayTimeForRound(params: StarHunterParams, index: number): number {
  return Math.max(params.minMs, params.startMs - index * params.stepMs);
}

/** Tek bir tur üretir. Konumlar 4x4 ızgaradan tekil seçilerek üst üste binme engellenir. */
export function generateStarRound(params: StarHunterParams, index: number, rng: Rng): StarRound {
  // Her iki turda bir renk ve bir yıldız eklenir (en fazla palet ve 14 yıldız).
  const grow = Math.floor(index / 2);
  const colorCount = Math.min(STAR_COLORS.length, params.colorCount + grow);
  const maxStars = Math.min(14, params.maxStars + grow);
  const palette = shuffle(rng, STAR_COLORS.map((c) => c.key)).slice(0, colorCount);
  const targetColor = pickOne(rng, palette);
  const total = randomInt(rng, Math.max(3, Math.floor(maxStars / 2)), maxStars);
  const targetCount = randomInt(rng, 1, Math.max(1, Math.min(maxStars - 2, total - 1)));

  const colors: StarColorKey[] = [];
  for (let i = 0; i < targetCount; i++) colors.push(targetColor);
  const others = palette.filter((c) => c !== targetColor);
  for (let i = targetCount; i < total; i++) colors.push(pickOne(rng, others));

  const cells = shuffle(rng, Array.from({ length: 16 }, (_, i) => i)).slice(0, total);
  const stars: Star[] = colors.map((color, i) => {
    const cell = cells[i];
    const col = cell % 4;
    const row = Math.floor(cell / 4);
    return { color, x: (col + 0.5) / 4, y: (row + 0.5) / 4 };
  });

  return {
    index,
    targetColor,
    palette,
    stars: shuffle(rng, stars),
    targetCount,
    displayMs: displayTimeForRound(params, index),
  };
}

export interface StarAnswer {
  guess: number;
  responseMs: number;
}

export function checkStarAnswer(round: StarRound, answer: StarAnswer): boolean {
  return answer.guess === round.targetCount;
}

export interface StarSummary {
  correct: number;
  total: number;
  accuracy: number;
  avgResponseMs: number | null;
  score: number;
}

export function summarizeStarHunter(
  rounds: StarRound[],
  answers: (StarAnswer | null)[],
): StarSummary {
  const total = rounds.length;
  let correct = 0;
  let responseSum = 0;
  let responseCount = 0;
  rounds.forEach((round, i) => {
    const a = answers[i];
    if (!a) return;
    if (checkStarAnswer(round, a)) correct++;
    responseSum += a.responseMs;
    responseCount++;
  });
  const accuracy = total > 0 ? correct / total : 0;
  return {
    correct,
    total,
    accuracy,
    avgResponseMs: responseCount > 0 ? Math.round(responseSum / responseCount) : null,
    score: Math.round(accuracy * 100),
  };
}
