/**
 * Eş Anlam Yakalama: bir kelimenin eş anlamlısını dört şıktan hızla bul.
 * Kelime dağarcığını genişletir; okurken kelimeyi anında anlama becerisini çalıştırır.
 */
import { Rng, randomInt, shuffle } from '../rng';
import { clampDifficulty } from './types';

export const SYNONYM_PAIRS: { word: string; synonym: string }[] = [
  { word: 'hızlı', synonym: 'çabuk' },
  { word: 'güzel', synonym: 'hoş' },
  { word: 'büyük', synonym: 'iri' },
  { word: 'küçük', synonym: 'minik' },
  { word: 'konuşmak', synonym: 'söylemek' },
  { word: 'bilgi', synonym: 'malumat' },
  { word: 'yardım', synonym: 'destek' },
  { word: 'sevinç', synonym: 'neşe' },
  { word: 'korku', synonym: 'endişe' },
  { word: 'başlamak', synonym: 'girişmek' },
  { word: 'bitirmek', synonym: 'sonlandırmak' },
  { word: 'zor', synonym: 'güç' },
  { word: 'kolay', synonym: 'basit' },
  { word: 'düşünce', synonym: 'fikir' },
  { word: 'ev', synonym: 'konut' },
  { word: 'dürüst', synonym: 'namuslu' },
  { word: 'yavaş', synonym: 'ağır' },
  { word: 'sakin', synonym: 'dingin' },
  { word: 'çalışkan', synonym: 'gayretli' },
  { word: 'hatıra', synonym: 'anı' },
];

export interface SynonymRound {
  index: number;
  word: string;
  options: string[];
  correctIndex: number;
}

export function synonymParams(difficulty: number): { rounds: number } {
  return { rounds: 5 + clampDifficulty(difficulty) };
}

/** Doğru eş anlamlı + üç farklı çeldirici (başka çiftlerin eş anlamlıları). */
export function generateSynonymRound(rounds: number, index: number, rng: Rng): SynonymRound {
  const pair = SYNONYM_PAIRS[randomInt(rng, 0, SYNONYM_PAIRS.length - 1)];
  const others = shuffle(
    rng,
    SYNONYM_PAIRS.filter((p) => p.word !== pair.word).map((p) => p.synonym),
  ).slice(0, 3);
  const correctIndex = randomInt(rng, 0, 3);
  const options: string[] = [];
  let o = 0;
  for (let i = 0; i < 4; i++) options.push(i === correctIndex ? pair.synonym : others[o++]);
  void rounds;
  return { index, word: pair.word, options, correctIndex };
}

export function summarizeSynonyms(rounds: SynonymRound[], answers: (number | null)[], responseMs: (number | null)[]) {
  let correct = 0;
  rounds.forEach((r, i) => {
    if (answers[i] === r.correctIndex) correct++;
  });
  const times = responseMs.filter((v): v is number => v !== null);
  return {
    correct,
    total: rounds.length,
    accuracy: rounds.length ? correct / rounds.length : 0,
    avgResponseMs: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null,
    score: rounds.length ? Math.round((correct / rounds.length) * 100) : 0,
  };
}

/** Bir oyunluk tur seti: aynı kelime iki kez sorulmaz (kelime sayısı yettiği sürece). */
export function generateSynonymSet(count: number, rng: Rng): SynonymRound[] {
  return shuffle(rng, SYNONYM_PAIRS).slice(0, count).map((pair, index) => {
    const others = shuffle(rng, SYNONYM_PAIRS.filter((p) => p.word !== pair.word).map((p) => p.synonym)).slice(0, 3);
    const correctIndex = randomInt(rng, 0, 3);
    const options = [...others];
    options.splice(correctIndex, 0, pair.synonym);
    return { index, word: pair.word, options, correctIndex };
  });
}
