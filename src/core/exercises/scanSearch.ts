/**
 * Hızlı Tarama: harf ızgarasında hedef harfin tüm geçişlerini süre dolmadan işaretle.
 * Sayfayı sistematik taramayı ve dikkat seçiciliğini çalıştırır.
 */
import { Rng, randomInt, shuffle } from '../rng';
import { clampDifficulty } from './types';

export const GRID_COLS = 6;
export const GRID_ROWS = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPRSTUVYZ'.split('');

export interface ScanParams {
  rounds: number;
  targetsPerRound: number;
  roundMs: number;
}

export function scanParams(difficulty: number, roundMs = 12000): ScanParams {
  const d = clampDifficulty(difficulty);
  return { rounds: 2 + Math.ceil(d / 2), targetsPerRound: 3 + d, roundMs };
}

export interface ScanRound {
  index: number;
  target: string;
  /** Hedef harflerin ızgara indeksleri (0..cols*rows-1). */
  targetCells: number[];
  grid: string[];
  roundMs: number;
}

export function generateScanRound(params: ScanParams, index: number, rng: Rng): ScanRound {
  const target = ALPHABET[randomInt(rng, 0, ALPHABET.length - 1)];
  const others = ALPHABET.filter((l) => l !== target);
  const size = GRID_COLS * GRID_ROWS;
  const targetCells = shuffle(rng, Array.from({ length: size }, (_, i) => i)).slice(0, params.targetsPerRound).sort((a, b) => a - b);
  const grid: string[] = [];
  for (let i = 0; i < size; i++) {
    grid.push(targetCells.includes(i) ? target : others[randomInt(rng, 0, others.length - 1)]);
  }
  return { index, target, targetCells, grid, roundMs: params.roundMs };
}

export interface ScanRoundResult {
  hits: number;
  falseMarks: number;
  misses: number;
  targets: number;
}

/** Bir turdaki işaretlemeleri hedeflerle karşılaştırır. */
export function scoreScanRound(targetCells: number[], marked: number[]): ScanRoundResult {
  const targetSet = new Set(targetCells);
  const markSet = new Set(marked);
  let hits = 0;
  let falseMarks = 0;
  markSet.forEach((m) => {
    if (targetSet.has(m)) hits++;
    else falseMarks++;
  });
  return { hits, falseMarks, misses: targetCells.length - hits, targets: targetCells.length };
}

/** Puan: isabetler artı, yanlış işaretler ceza (yarım). 0–100 aralığında. */
export function summarizeScan(results: ScanRoundResult[]) {
  const targets = results.reduce((s, r) => s + r.targets, 0);
  const hits = results.reduce((s, r) => s + r.hits, 0);
  const falseMarks = results.reduce((s, r) => s + r.falseMarks, 0);
  const raw = targets > 0 ? (hits - falseMarks * 0.5) / targets : 0;
  const accuracy = targets > 0 ? hits / targets : 0;
  return {
    correct: hits,
    total: targets,
    accuracy,
    avgResponseMs: null as number | null,
    score: Math.round(Math.min(1, Math.max(0, raw)) * 100),
  };
}
