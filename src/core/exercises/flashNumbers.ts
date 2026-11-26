/**
 * Takistoskopik görüş (flaş sayılar): sayı çok kısa süre gösterilir, kullanıcı görülen sayıyı yazar.
 */
import { Rng, randomInt } from '../rng';
import { clampDifficulty } from './types';

export interface FlashParams {
  rounds: number;
  digits: number;
  flashMs: number;
}

/** flashMs: hız ayarı (ör. 300 ms). Zorlukla basamak sayısı artar. */
export function flashParams(difficulty: number, flashMs = 300): FlashParams {
  const d = clampDifficulty(difficulty);
  return { rounds: 4 + d, digits: 2 + d, flashMs };
}

export interface FlashRound {
  index: number;
  value: string;
  flashMs: number;
}

export function generateFlashRound(params: FlashParams, index: number, rng: Rng): FlashRound {
  let value = String(randomInt(rng, 1, 9));
  for (let i = 1; i < params.digits; i++) value += String(randomInt(rng, 0, 9));
  return { index, value, flashMs: params.flashMs };
}

export function checkFlashAnswer(round: FlashRound, input: string): boolean {
  return input.trim() === round.value;
}

/** Yanıt süresi dahil değerlendirme. Doğru oranı ve ortalama tepki süresi. */
export function summarizeFlash(
  rounds: FlashRound[],
  inputs: { input: string; responseMs: number }[],
) {
  let correct = 0;
  let responseSum = 0;
  rounds.forEach((r, i) => {
    const a = inputs[i];
    if (!a) return;
    if (checkFlashAnswer(r, a.input)) correct++;
    responseSum += a.responseMs;
  });
  const total = rounds.length;
  const answered = inputs.filter(Boolean).length;
  return {
    correct,
    total,
    accuracy: total > 0 ? correct / total : 0,
    avgResponseMs: answered > 0 ? Math.round(responseSum / answered) : null,
    score: total > 0 ? Math.round((correct / total) * 100) : 0,
  };
}
