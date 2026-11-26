/**
 * Nesneyi Takip Et: nokta dairesel veya Lissajous yolunda hareket eder. Rastgele anlarda rengi değişir;
 * kullanıcı hedef rengi gördüğünde dokunur. Doğru dokunuş = isabet, hedefi kaçırma = ıskalama,
 * hedef yokken dokunuş = yanlış alarm.
 */
import { Rng, randomInt } from '../rng';
import { clampDifficulty } from './types';

export interface TrackingParams {
  durationMs: number;
  /** Hedef göstergesinin süresi (ms). */
  targetWindowMs: number;
  /** Yaklaşık hedef sayısı. */
  targets: number;
  /** Dönüş hızı (rad/sn). */
  angularSpeed: number;
  pattern: 'circle' | 'lissajous';
}

export function trackingParams(difficulty: number, durationSec = 30, speedMs = 1000): TrackingParams {
  const d = clampDifficulty(difficulty);
  return {
    durationMs: durationSec * 1000,
    targetWindowMs: Math.max(300, speedMs),
    targets: 4 + d * 2,
    angularSpeed: 0.6 + d * 0.25,
    pattern: d >= 3 ? 'lissajous' : 'circle',
  };
}

/** Zaman t (ms) için nokta konumu, normalize 0..1. */
export function trackingPosition(t: number, params: TrackingParams): { x: number; y: number } {
  const w = (params.angularSpeed * t) / 1000;
  if (params.pattern === 'circle') {
    return { x: 0.5 + 0.38 * Math.cos(w), y: 0.5 + 0.38 * Math.sin(w) };
  }
  return { x: 0.5 + 0.38 * Math.sin(w * 2), y: 0.5 + 0.3 * Math.sin(w * 3 + Math.PI / 4) };
}

export interface TargetWindow {
  startMs: number;
  endMs: number;
}

/** Rastgele, birbiriyle çakışmayan hedef pencereleri üretir. */
export function generateTargetWindows(params: TrackingParams, rng: Rng): TargetWindow[] {
  const windows: TargetWindow[] = [];
  const slot = params.durationMs / (params.targets + 1);
  for (let i = 1; i <= params.targets; i++) {
    const jitter = randomInt(rng, -Math.floor(slot / 4), Math.floor(slot / 4));
    const start = Math.round(i * slot + jitter);
    if (start < 0 || start + params.targetWindowMs > params.durationMs) continue;
    windows.push({ startMs: start, endMs: start + params.targetWindowMs });
  }
  return windows;
}

export interface TrackingSummary {
  hits: number;
  misses: number;
  falseAlarms: number;
  accuracy: number;
  score: number;
  avgResponseMs: number | null;
}

/** Dokunuş zamanları (ms) ile hedef pencerelerini eşleştirir. */
export function scoreTracking(windows: TargetWindow[], taps: number[]): TrackingSummary {
  const hitWindows = new Set<number>();
  let falseAlarms = 0;
  const responses: number[] = [];

  for (const tap of taps) {
    const idx = windows.findIndex((w, i) => !hitWindows.has(i) && tap >= w.startMs && tap <= w.endMs);
    if (idx >= 0) {
      hitWindows.add(idx);
      responses.push(tap - windows[idx].startMs);
    } else {
      falseAlarms++;
    }
  }
  const hits = hitWindows.size;
  const misses = windows.length - hits;
  const total = windows.length;
  const accuracy = total > 0 ? hits / total : 0;
  const score = Math.max(0, Math.round((hits - falseAlarms) * (100 / Math.max(1, total))));
  return {
    hits,
    misses,
    falseAlarms,
    accuracy,
    score: Math.min(100, score),
    avgResponseMs: responses.length
      ? Math.round(responses.reduce((a, b) => a + b, 0) / responses.length)
      : null,
  };
}
