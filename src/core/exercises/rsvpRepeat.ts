/**
 * Kelime Akışı: kelimeler sabit hızda tek tek gösterilir. Bir kelime hemen önceki kelimenin aynısıysa
 * (tekrar) kullanıcı dokunur. Geri dönmeden akıcı ilerleme ve dikkat becerisini çalıştırır.
 */
import { Rng, pickOne } from '../rng';
import { WORD_POOL } from './wordBlocks';
import { TargetWindow, scoreTracking, TrackingSummary } from './tracking';
import { clampDifficulty } from './types';

export interface RsvpParams {
  count: number;
  wordMs: number;
}

export function rsvpParams(difficulty: number, wordMs = 350): RsvpParams {
  const d = clampDifficulty(difficulty);
  return { count: 30 + d * 10, wordMs };
}

export interface RsvpStream {
  words: string[];
  /** Tekrar olan indeksler (kullanıcının dokunması gereken yerler). */
  repeats: number[];
  wordMs: number;
}

export function generateRsvpStream(params: RsvpParams, rng: Rng, repeatRate = 0.12): RsvpStream {
  const words: string[] = [];
  const repeats: number[] = [];
  for (let i = 0; i < params.count; i++) {
    if (i > 0 && rng() < repeatRate && words[i - 1] !== undefined) {
      words.push(words[i - 1]);
      repeats.push(i);
    } else {
      let w = pickOne(rng, WORD_POOL);
      if (i > 0) {
        let guard = 0;
        while (w === words[i - 1] && guard++ < 20) w = pickOne(rng, WORD_POOL);
      }
      words.push(w);
    }
  }
  return { words, repeats, wordMs: params.wordMs };
}

/** Her tekrar kelimesi, gösterildiği süre aralığında bir hedef penceresidir. */
export function rsvpWindows(stream: RsvpStream): TargetWindow[] {
  return stream.repeats.map((i) => ({ startMs: i * stream.wordMs, endMs: (i + 1) * stream.wordMs }));
}

export function scoreRsvp(stream: RsvpStream, tapsMs: number[]): TrackingSummary {
  return scoreTracking(rsvpWindows(stream), tapsMs);
}
