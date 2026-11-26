/** Kelime oyunlarının tur üretimi ve puanlaması (saf işlevler). */
import { FAKE_WORDS, REAL_WORDS, TRUE_FALSE, HUNT_WORDS, MEMORY_WORDS, MISSING_WORD, PHRASE_SENTENCES, SENTENCE_FINISH, WORD_FAMILIES } from '../../content/wordGames';
import { BUILTIN_TEXTS } from '../../content/builtinTexts';
import { Rng, pickOne, randomInt, shuffle } from '../rng';
import { clampDifficulty } from './types';

export interface ChoiceRound {
  /** Cevaptan önce kısa süre gösterilen parçalar (varsa). */
  flash?: string[];
  prompt: string;
  options: string[];
  correctIndex: number;
  /** Bu sürede cevap verilmezse tur yanlış sayılır. */
  limitMs?: number;
  /** Soru yazısının rengi (renk-kelime oyunu). */
  promptColor?: string;
}

const withAnswer = (rng: Rng, correct: string, wrong: string[]) => {
  const options = shuffle(rng, [correct, ...wrong]);
  return { options, correctIndex: options.indexOf(correct) };
};

export function wordFindRounds(difficulty: number, rng: Rng): ChoiceRound[] {
  const d = clampDifficulty(difficulty);
  const size = 3 + d;
  return shuffle(rng, WORD_FAMILIES)
    .slice(0, 8)
    .map((family) => {
      const target = pickOne(rng, family);
      const similar = family.filter((w) => w !== target);
      const filler = shuffle(rng, WORD_FAMILIES.flat().filter((w) => !family.includes(w)));
      const wrong = [...similar, ...filler].slice(0, size - 1);
      return { prompt: target, ...withAnswer(rng, target, wrong) };
    });
}

export function phraseRounds(difficulty: number, rng: Rng): ChoiceRound[] {
  const d = clampDifficulty(difficulty);
  return shuffle(rng, PHRASE_SENTENCES)
    .slice(0, 4 + d)
    .map((groups) => {
      const correct = pickOne(rng, groups);
      const wrong = shuffle(rng, PHRASE_SENTENCES.filter((s) => s !== groups).flat()).filter((g) => !groups.includes(g)).slice(0, 3);
      return { flash: groups, prompt: '', ...withAnswer(rng, correct, wrong) };
    });
}

export function missingWordRounds(difficulty: number, rng: Rng): ChoiceRound[] {
  const d = clampDifficulty(difficulty);
  return shuffle(rng, MISSING_WORD)
    .slice(0, 5 + d)
    .map(([sentence, correct, ...wrong]) => ({ prompt: sentence, ...withAnswer(rng, correct, d <= 2 ? wrong.slice(0, 2) : wrong) }));
}

export function sentenceFinishRounds(difficulty: number, rng: Rng): ChoiceRound[] {
  const d = clampDifficulty(difficulty);
  return shuffle(rng, SENTENCE_FINISH)
    .slice(0, 3 + Math.ceil(d / 2))
    .map(([paragraph, correct, ...wrong]) => ({ prompt: paragraph, ...withAnswer(rng, correct, wrong) }));
}

export interface TypoRound {
  words: string[];
  wrongIndex: number;
  original: string;
}

const VOWEL_SWAP: Record<string, string> = { a: 'e', e: 'a', ı: 'i', i: 'ı', o: 'ö', ö: 'o', u: 'ü', ü: 'u' };

/** Kolayda sona fazladan harf, ortada harf yinelemesi, zorda iç harflerin yeri ya da ünlü değişir. */
export function misspell(word: string, difficulty: number, rng: Rng): string {
  const d = clampDifficulty(difficulty);
  const letters = word.match(/^\p{L}+/u)?.[0] ?? word;
  const tail = word.slice(letters.length);
  if (d <= 2) return `${letters}ğ${tail}`;
  const i = randomInt(rng, 1, Math.max(1, letters.length - 3));
  if (d === 3) return letters.slice(0, i) + letters[i] + letters.slice(i) + tail;
  if (letters[i] !== letters[i + 1]) {
    return letters.slice(0, i) + letters[i + 1] + letters[i] + letters.slice(i + 2) + tail;
  }
  const v = [...letters].findIndex((c) => c in VOWEL_SWAP);
  return v >= 0 ? letters.slice(0, v) + VOWEL_SWAP[letters[v]] + letters.slice(v + 1) + tail : `${letters}${letters.slice(-1)}${tail}`;
}

export function typoRounds(difficulty: number, rng: Rng): TypoRound[] {
  const d = clampDifficulty(difficulty);
  const sentences = BUILTIN_TEXTS.flatMap((t) => t.body.split(/(?<=[.!?])\s+/)).filter((s) => {
    const n = s.split(' ').length;
    return n >= 6 && n <= 8 + d * 2 && s.split(' ').some((w) => /^\p{Ll}{5,}/u.test(w));
  });
  return shuffle(rng, sentences)
    .slice(0, 6)
    .map((sentence) => {
      const words = sentence.split(' ');
      const candidates = words.map((w, i) => (/^\p{Ll}{5,}/u.test(w) ? i : -1)).filter((i) => i >= 0);
      const wrongIndex = pickOne(rng, candidates);
      const original = words[wrongIndex];
      const next = [...words];
      next[wrongIndex] = misspell(original, d, rng);
      return { words: next, wrongIndex, original };
    });
}

export const MEMORY_COUNTS = [3, 5, 7, 9, 10];

export interface MemoryRound {
  words: string[];
  options: string[];
}

export function wordMemoryRounds(difficulty: number, rng: Rng): MemoryRound[] {
  const count = MEMORY_COUNTS[clampDifficulty(difficulty) - 1];
  return Array.from({ length: 3 }, () => {
    const pool = shuffle(rng, MEMORY_WORDS).slice(0, count * 2);
    return { words: pool.slice(0, count), options: shuffle(rng, pool) };
  });
}

export interface HuntPuzzle {
  size: number;
  grid: string[];
  words: { word: string; cells: number[] }[];
}

const FILLER = 'ABCÇDEFGHIİKLMNOÖPRSŞTUÜVYZ';

export function wordHuntPuzzle(difficulty: number, rng: Rng): HuntPuzzle {
  const d = clampDifficulty(difficulty);
  const size = [6, 6, 7, 8, 8][d - 1];
  const count = [3, 4, 4, 5, 6][d - 1];
  const directions = d >= 3 ? [[0, 1], [1, 0], [1, 1]] : [[0, 1], [1, 0]];
  const grid: string[] = Array(size * size).fill('');
  const words: HuntPuzzle['words'] = [];
  for (const word of shuffle(rng, HUNT_WORDS.filter((w) => w.length <= size))) {
    if (words.length === count) break;
    const letters = [...word];
    for (let attempt = 0; attempt < 60; attempt++) {
      const [dr, dc] = pickOne(rng, directions);
      const row = randomInt(rng, 0, size - 1 - dr * (letters.length - 1));
      const col = randomInt(rng, 0, size - 1 - dc * (letters.length - 1));
      if (row < 0 || col < 0) continue;
      const cells = letters.map((_, i) => (row + dr * i) * size + col + dc * i);
      if (!cells.every((c, i) => grid[c] === '' || grid[c] === letters[i])) continue;
      cells.forEach((c, i) => (grid[c] = letters[i]));
      words.push({ word, cells });
      break;
    }
  }
  const filled = grid.map((c) => c || FILLER[randomInt(rng, 0, FILLER.length - 1)]);
  return { size, grid: filled, words };
}

/** İlk ve son harfe dokunmayla seçilen sözcük (iki yönde de geçerli); yoksa null. */
export function huntMatch(puzzle: HuntPuzzle, a: number, b: number): string | null {
  const hit = puzzle.words.find((w) => {
    const first = w.cells[0];
    const last = w.cells[w.cells.length - 1];
    return (first === a && last === b) || (first === b && last === a);
  });
  return hit?.word ?? null;
}

const LIMITS = [1, 0.85, 0.72, 0.6, 0.5];

export function realOrFakeRounds(difficulty: number, rng: Rng): ChoiceRound[] {
  const d = clampDifficulty(difficulty);
  const count = 10 + d * 2;
  const half = count / 2;
  const items = [
    ...shuffle(rng, REAL_WORDS).slice(0, half).map((w) => ({ w, real: true })),
    ...shuffle(rng, FAKE_WORDS).slice(0, half).map((w) => ({ w, real: false })),
  ];
  return shuffle(rng, items).map(({ w, real }) => ({ prompt: w, options: ['Gerçek', 'Uydurma'], correctIndex: real ? 0 : 1, limitMs: Math.round(3000 * LIMITS[d - 1]) }));
}

export function trueFalseRounds(difficulty: number, rng: Rng): ChoiceRound[] {
  const d = clampDifficulty(difficulty);
  return shuffle(rng, TRUE_FALSE)
    .slice(0, 6 + d * 2)
    .map(([sentence, truth]) => ({ prompt: sentence, options: ['Doğru', 'Yanlış'], correctIndex: truth ? 0 : 1, limitMs: Math.round(6000 * LIMITS[d - 1]) }));
}

/** Labirent okuma: akan metinde her boşluk için metne uyan sözcük seçilir. */
export function mazeRounds(difficulty: number, rng: Rng): ChoiceRound[] {
  const d = clampDifficulty(difficulty);
  const isWord = (w: string) => /^\p{Ll}{4,}[.,;]?$/u.test(w);
  const bare = (w: string) => w.replace(/[.,;]$/, '');
  const text = pickOne(rng, BUILTIN_TEXTS);
  const words = text.body.split(/\s+/);
  const own = new Set(words.map((w) => bare(w).slice(0, 4)));
  const pool = [...new Set(BUILTIN_TEXTS.flatMap((t) => t.body.split(/\s+/)).filter(isWord).map(bare))].filter((w) => !own.has(w.slice(0, 4)));
  const rounds: ChoiceRound[] = [];
  let last = 0;
  for (let i = 5; i < words.length && rounds.length < 5 + d; i++) {
    if (i - last < 6 || !isWord(words[i])) continue;
    const correct = bare(words[i]);
    const prompt = `${words.slice(Math.max(0, i - 14), i).join(' ')} ___`;
    rounds.push({ prompt, ...withAnswer(rng, correct, shuffle(rng, pool).slice(0, d <= 2 ? 2 : 3)) });
    last = i;
  }
  return rounds;
}

export interface ChainRound {
  letters: string[];
  /** Yeni bir sözcüğün başladığı harf sıraları (ilk sözcük hariç). */
  starts: number[];
  words: string[];
}

export function wordChainRounds(difficulty: number, rng: Rng): ChainRound[] {
  const count = [2, 3, 3, 4, 5][clampDifficulty(difficulty) - 1];
  return Array.from({ length: 5 }, () => {
    const words = shuffle(rng, MEMORY_WORDS).slice(0, count);
    const starts: number[] = [];
    let at = 0;
    for (const w of words.slice(0, -1)) {
      at += [...w].length;
      starts.push(at);
    }
    return { letters: [...words.join('')], starts, words };
  });
}

export const chainCorrect = (round: ChainRound, picked: number[]) =>
  picked.length === round.starts.length && round.starts.every((s) => picked.includes(s));

export function summarizeGame(correct: number, total: number, responseMs: number[] = []) {
  const accuracy = total > 0 ? correct / total : 0;
  return {
    accuracy,
    score: Math.round(accuracy * 100),
    avgResponseMs: responseMs.length ? Math.round(responseMs.reduce((a, b) => a + b, 0) / responseMs.length) : null,
  };
}
