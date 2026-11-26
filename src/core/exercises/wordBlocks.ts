/**
 * Kelime Blokları (gruplama): birkaç kelimelik bir ifade çok kısa gösterilir; kullanıcı görülen
 * ifadeyi şıklardan seçer. Tek bakışta kelime gruplarını algılama (fixation başına daha çok kelime) becerisini çalıştırır.
 */
import { Rng, pickOne, randomInt, shuffle } from '../rng';
import { clampDifficulty } from './types';

/** Ortak, sade Türkçe kelimeler. */
export const WORD_POOL = [
  'okul', 'kitap', 'deniz', 'güneş', 'bahçe', 'köprü', 'pencere', 'yol', 'sabah', 'akşam',
  'çiçek', 'kapı', 'masa', 'defter', 'ağaç', 'rüzgâr', 'sokak', 'bulut', 'taş', 'su',
  'ekmek', 'çay', 'şehir', 'orman', 'dağ', 'nehir', 'müzik', 'resim', 'kalem', 'çanta',
  'merdiven', 'oda', 'yıldız', 'kuş', 'balık', 'elma', 'hikâye', 'harita', 'tren', 'bisiklet',
];

export interface WordBlockParams {
  rounds: number;
  blockSize: number;
  flashMs: number;
}

export function wordBlockParams(difficulty: number, flashMs = 600): WordBlockParams {
  const d = clampDifficulty(difficulty);
  return { rounds: 4 + d, blockSize: 2 + Math.min(d, 3), flashMs };
}

export interface WordBlockRound {
  index: number;
  phrase: string;
  options: string[];
  correctIndex: number;
  flashMs: number;
}

/** Bir tur: doğru ifade + üç çeldirici (aynı kelimelerin karışık/yer değiştirmiş hali). */
export function generateWordBlockRound(params: WordBlockParams, index: number, rng: Rng): WordBlockRound {
  const words = shuffle(rng, WORD_POOL).slice(0, params.blockSize);
  const phrase = words.join(' ');
  const distractors = new Set<string>();
  let guard = 0;
  while (distractors.size < 3 && guard < 50) {
    guard++;
    const candidate = shuffle(rng, words).join(' ');
    if (candidate !== phrase) distractors.add(candidate);
  }
  // Yeterince farklı çeldirici yoksa, bir kelimeyi değiştirerek tamamla.
  while (distractors.size < 3) {
    const swapped = [...words];
    swapped[0] = pickOne(rng, WORD_POOL.filter((w) => !words.includes(w)));
    const candidate = swapped.join(' ');
    if (candidate !== phrase) distractors.add(candidate);
  }
  const correctIndex = randomInt(rng, 0, 3);
  const others = [...distractors];
  const options: string[] = [];
  let o = 0;
  for (let i = 0; i < 4; i++) options.push(i === correctIndex ? phrase : others[o++]);
  return { index, phrase, options, correctIndex, flashMs: params.flashMs };
}

export function checkWordBlockAnswer(round: WordBlockRound, selected: number): boolean {
  return selected === round.correctIndex;
}

export function summarizeWordBlocks(rounds: WordBlockRound[], answers: (number | null)[]) {
  let correct = 0;
  rounds.forEach((r, i) => {
    const a = answers[i];
    if (a !== null && a !== undefined && checkWordBlockAnswer(r, a)) correct++;
  });
  const total = rounds.length;
  return {
    correct,
    total,
    accuracy: total > 0 ? correct / total : 0,
    avgResponseMs: null as number | null,
    score: total > 0 ? Math.round((correct / total) * 100) : 0,
  };
}
