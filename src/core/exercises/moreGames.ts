/** Ek egzersizlerin tur üretimi (saf işlevler). */
import { ANIMALS, ANTONYMS, CONNECTORS, INKS, LOOKALIKES, OBJECTS, ODD_CATEGORY } from '../../content/moreGames';
import { BUILTIN_TEXTS, LEVEL_TEST_KEY } from '../../content/builtinTexts';
import { Rng, pickOne, randomInt, shuffle } from '../rng';
import { clampDifficulty } from './types';
import type { ChoiceRound } from './wordGames';

const withAnswer = (rng: Rng, correct: string, wrong: string[]) => {
  const options = shuffle(rng, [correct, ...wrong]);
  return { options, correctIndex: options.indexOf(correct) };
};

const TEXTS = BUILTIN_TEXTS.filter((t) => t.key !== LEVEL_TEST_KEY);
const sentencesOf = (body: string) => body.split(/(?<=[.!?])\s+/).filter((s) => s.length > 0);

/** Stroop: yazılan renk adı değil, yazının rengi seçilir. */
export function stroopRounds(difficulty: number, rng: Rng): ChoiceRound[] {
  const d = clampDifficulty(difficulty);
  const inks = INKS.slice(0, d <= 2 ? 3 : d <= 4 ? 4 : 5);
  return Array.from({ length: 8 + d * 2 }, () => {
    const ink = pickOne(rng, inks);
    const word = rng() < 0.25 ? ink : pickOne(rng, inks.filter((i) => i !== ink));
    return {
      prompt: word.name.toLocaleUpperCase('tr-TR'),
      promptColor: ink.hex,
      options: inks.map((i) => i.name),
      correctIndex: inks.indexOf(ink),
      limitMs: 4200 - d * 500,
    };
  });
}

export function antonymRounds(difficulty: number, rng: Rng): ChoiceRound[] {
  const d = clampDifficulty(difficulty);
  return shuffle(rng, ANTONYMS)
    .slice(0, 6 + d)
    .map(([word, opposite]) => {
      const others = shuffle(rng, ANTONYMS.filter(([w]) => w !== word).map((p) => p[1])).slice(0, d <= 2 ? 2 : 3);
      return { prompt: word, ...withAnswer(rng, opposite, others) };
    });
}

export function categoryOddRounds(difficulty: number, rng: Rng): ChoiceRound[] {
  const d = clampDifficulty(difficulty);
  return shuffle(rng, ODD_CATEGORY)
    .slice(0, 6 + d)
    .map(([a, b, c, odd]) => ({ prompt: '', ...withAnswer(rng, odd, [a, b, c]), limitMs: d >= 3 ? 9000 - d * 800 : undefined }));
}

export function connectorRounds(difficulty: number, rng: Rng): ChoiceRound[] {
  const d = clampDifficulty(difficulty);
  return shuffle(rng, CONNECTORS)
    .slice(0, 5 + d)
    .map(([sentence, correct, ...wrong]) => ({ prompt: sentence, ...withAnswer(rng, correct, wrong) }));
}

export function mainIdeaRounds(difficulty: number, rng: Rng): ChoiceRound[] {
  const d = clampDifficulty(difficulty);
  return shuffle(rng, TEXTS)
    .slice(0, 3 + Math.ceil(d / 2))
    .map((text) => {
      const sentences = sentencesOf(text.body);
      // Zorluk arttıkça paragrafın daha küçük bölümünden çıkarım istenir.
      const shown = sentences.slice(0, Math.max(2, 7 - d));
      const wrong = shuffle(rng, TEXTS.filter((t) => t.key !== text.key)).slice(0, 3).map((t) => t.title);
      return { prompt: shown.join(' '), ...withAnswer(rng, text.title, wrong) };
    });
}

/** Bilgi tarama: verilen sözcükten hemen sonra gelen sözcüğü paragrafta bul. */
export function scanAnswerRounds(difficulty: number, rng: Rng): ChoiceRound[] {
  const d = clampDifficulty(difficulty);
  const clean = (w: string) => w.toLocaleLowerCase('tr-TR').replace(/[^\p{L}]/gu, '');
  const rounds: ChoiceRound[] = [];
  for (const text of shuffle(rng, TEXTS)) {
    if (rounds.length === 5) break;
    const words = sentencesOf(text.body).slice(0, 1 + d).join(' ').split(/\s+/);
    const bare = words.map(clean);
    const spots = bare.map((w, i) => i).filter((i) => i < bare.length - 1 && bare[i].length >= 5 && bare[i + 1].length >= 4 && bare.indexOf(bare[i]) === bare.lastIndexOf(bare[i]));
    if (spots.length === 0) continue;
    const at = pickOne(rng, spots);
    const answer = bare[at + 1];
    const wrong = shuffle(rng, [...new Set(bare.filter((w) => w.length >= 4 && w !== answer && w !== bare[at]))]).slice(0, 3);
    if (wrong.length < 3) continue;
    rounds.push({ prompt: `“${bare[at]}” sözcüğünden hemen sonra hangisi geliyor?\n\n${words.join(' ')}`, ...withAnswer(rng, answer, wrong), limitMs: 26000 - d * 2500 });
  }
  return rounds;
}

export interface OrderRound {
  /** Karışık sırayla gösterilen cümleler. */
  shuffled: string[];
  /** Doğru sıra. */
  correct: string[];
}

export function sentenceOrderRounds(difficulty: number, rng: Rng): OrderRound[] {
  const count = [3, 3, 4, 4, 5][clampDifficulty(difficulty) - 1];
  return shuffle(rng, TEXTS.filter((t) => sentencesOf(t.body).length >= count))
    .slice(0, 3)
    .map((t) => {
      const correct = sentencesOf(t.body).slice(0, count);
      let shuffled = shuffle(rng, correct);
      if (shuffled.every((s, i) => s === correct[i])) shuffled = [...correct].reverse();
      return { shuffled, correct };
    });
}

export const orderScore = (round: OrderRound, picked: string[]) => round.correct.filter((s, i) => picked[i] === s).length;

export interface OddRound {
  cols: number;
  cells: string[];
  oddIndex: number;
  limitMs: number;
}

export function oddOneRounds(difficulty: number, rng: Rng): OddRound[] {
  const d = clampDifficulty(difficulty);
  const cols = [4, 5, 5, 6, 7][d - 1];
  return Array.from({ length: 8 }, () => {
    const [a, b] = pickOne(rng, LOOKALIKES);
    const [base, odd] = rng() < 0.5 ? [a, b] : [b, a];
    const oddIndex = randomInt(rng, 0, cols * cols - 1);
    return { cols, cells: Array.from({ length: cols * cols }, (_, i) => (i === oddIndex ? odd : base)), oddIndex, limitMs: 9000 - d * 900 };
  });
}

export const CORSI_COLS = 4;

export function corsiRounds(difficulty: number, rng: Rng): number[][] {
  const length = 2 + clampDifficulty(difficulty);
  return Array.from({ length: 4 }, () => shuffle(rng, Array.from({ length: CORSI_COLS * CORSI_COLS }, (_, i) => i)).slice(0, length));
}

export interface FlowItem {
  word: string;
  column: 0 | 1;
  target: boolean;
}

/** Sütun akışı: sözcükler sağ ve sol sütunda sırayla belirir; hayvan adlarına dokunulur. */
export function columnFlow(difficulty: number, rng: Rng): FlowItem[] {
  const count = 18 + clampDifficulty(difficulty) * 3;
  const targets = Math.round(count / 3);
  const words = shuffle(rng, [
    ...Array.from({ length: targets }, () => ({ word: pickOne(rng, ANIMALS), target: true })),
    ...Array.from({ length: count - targets }, () => ({ word: pickOne(rng, OBJECTS), target: false })),
  ]);
  return words.map((w, i) => ({ ...w, column: (i % 2) as 0 | 1 }));
}

export interface PacerText {
  key: string;
  title: string;
  lines: { text: string; ms: number }[];
  wpm: number;
  questions: { question: string; options: string[]; correctIndex: number }[];
}

export function pacerText(difficulty: number, rng: Rng): PacerText {
  const wpm = 100 + clampDifficulty(difficulty) * 60;
  const text = pickOne(rng, TEXTS);
  const words = text.body.split(/\s+/);
  const lines: PacerText['lines'] = [];
  for (let i = 0; i < words.length; i += 5) {
    const part = words.slice(i, i + 5);
    lines.push({ text: part.join(' '), ms: Math.round((part.length * 60000) / wpm) });
  }
  return { key: text.key, title: text.title, lines, wpm, questions: text.questions };
}
