/**
 * Zigzag (yatay / dikey): hedef iki kenar arasında sırayla belirir; kullanıcı her hedefe mümkün olduğunca
 * hızlı dokunur. Hız ayarı hedef aralığını (ms) belirler.
 */
import { clampDifficulty } from './types';

export type ZigzagOrientation = 'horizontal' | 'vertical';

export interface ZigzagParams {
  orientation: ZigzagOrientation;
  steps: number;
  intervalMs: number;
}

export function zigzagParams(
  orientation: ZigzagOrientation,
  difficulty: number,
  speedMs = 900,
): ZigzagParams {
  const d = clampDifficulty(difficulty);
  return {
    orientation,
    steps: 12 + d * 4,
    intervalMs: Math.max(250, speedMs - d * 60),
  };
}

export interface ZigzagStep {
  /** İki uçtan hangisi: 0 = sol/üst, 1 = sağ/alt. */
  side: 0 | 1;
  /** Normalize konum; yatay için x, dikey için y ekseni. */
  position: { x: number; y: number };
}

/** Sıra, sol-sağ (veya üst-alt) arasında dönüşümlü gider. */
export function generateZigzagSteps(params: ZigzagParams): ZigzagStep[] {
  const steps: ZigzagStep[] = [];
  for (let i = 0; i < params.steps; i++) {
    const side = (i % 2) as 0 | 1;
    const edge = side === 0 ? 0.15 : 0.85;
    // Hedef konumu: kenar + merkeze doğru hafif kayma (her turda farklı yükseklik/genişlik)
    const offset = 0.5 + 0.3 * Math.sin(i * 1.7);
    const position =
      params.orientation === 'horizontal' ? { x: edge, y: offset } : { x: offset, y: edge };
    steps.push({ side, position });
  }
  return steps;
}

export interface ZigzagSummary {
  hits: number;
  total: number;
  accuracy: number;
  score: number;
  avgResponseMs: number | null;
}

/** Her adım için tepki süresi (ms) veya zamanında dokunulmadıysa null. */
export function summarizeZigzag(responses: (number | null)[], intervalMs: number): ZigzagSummary {
  const total = responses.length;
  const hitResponses = responses.filter(
    (r): r is number => r !== null && r >= 0 && r <= intervalMs,
  );
  const hits = hitResponses.length;
  return {
    hits,
    total,
    accuracy: total > 0 ? hits / total : 0,
    score: total > 0 ? Math.round((hits / total) * 100) : 0,
    avgResponseMs: hits > 0 ? Math.round(hitResponses.reduce((a, b) => a + b, 0) / hits) : null,
  };
}
