/**
 * Harfleri Gör: ekranın merkezindeki artı işaretine bakarken çevredeki harfler kısa süre belirir.
 * Kullanıcı kaç harf fark ettiğini girer. Harfler 8 sektörden birine yerleşir (üst üste binmez).
 */
import { Rng, randomInt, shuffle } from '../rng';
import { clampDifficulty } from './types';

export const LETTERS = 'ABCDEFGHIJKLMNOPRSTUVYZ'.split('');

export interface PeripheralParams {
  rounds: number;
  maxLetters: number;
  flashMs: number;
  /** Harfler merkezden uzaklık (0..1 ölçeğinde). Zorlukla artar. */
  radius: number;
}

export function peripheralParams(difficulty: number, flashMs = 400): PeripheralParams {
  const d = clampDifficulty(difficulty);
  return {
    rounds: 3 + d,
    maxLetters: Math.min(8, 2 + d),
    flashMs,
    radius: 0.25 + d * 0.05,
  };
}

export interface PeripheralLetter {
  letter: string;
  /** Radyan cinsinden açı; merkez (0.5,0.5)'ten dış çember üzerinde. */
  angle: number;
}

export interface PeripheralRound {
  index: number;
  letters: PeripheralLetter[];
  flashMs: number;
  radius: number;
}

export function generatePeripheralRound(params: PeripheralParams, index: number, rng: Rng): PeripheralRound {
  const count = randomInt(rng, 1, params.maxLetters);
  const sectors = shuffle(rng, Array.from({ length: 8 }, (_, i) => i)).slice(0, count);
  const letters = sectors.map((s) => ({
    letter: LETTERS[randomInt(rng, 0, LETTERS.length - 1)],
    angle: (s / 8) * Math.PI * 2,
  }));
  return { index, letters, flashMs: params.flashMs, radius: params.radius };
}

export function checkPeripheralAnswer(round: PeripheralRound, guessCount: number): boolean {
  return guessCount === round.letters.length;
}

export function summarizePeripheral(rounds: PeripheralRound[], guesses: (number | null)[]) {
  let correct = 0;
  rounds.forEach((r, i) => {
    const g = guesses[i];
    if (g !== null && g !== undefined && checkPeripheralAnswer(r, g)) correct++;
  });
  const total = rounds.length;
  return {
    correct,
    total,
    accuracy: total > 0 ? correct / total : 0,
    avgResponseMs: null,
    score: total > 0 ? Math.round((correct / total) * 100) : 0,
  };
}
