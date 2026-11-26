/**
 * Satır Tarama: birkaç cümle alt alta gösterilir; hedef kelimenin geçtiği satırı en hızlı bul.
 * Satırları sayfa gibi tarayıp ilgili yeri hızla seçme becerisini çalıştırır.
 */
import { BUILTIN_TEXTS } from '../../content/builtinTexts';
import { Rng, randomInt, shuffle } from '../rng';
import { clampDifficulty } from './types';

export interface LineScanParams {
  rounds: number;
  lines: number;
}

export function lineScanParams(difficulty: number): LineScanParams {
  const d = clampDifficulty(difficulty);
  return { rounds: 3 + d, lines: 4 + Math.min(d, 4) };
}

export interface LineScanRound {
  index: number;
  lines: string[];
  targetWord: string;
  targetLine: number;
}

/** Sayfadaki tüm cümleler (kısa olanlar hariç). */
export function allSentences(): string[] {
  return BUILTIN_TEXTS.flatMap((t) =>
    t.body.split(/(?<=[.!?…])\s+/).map((s) => s.trim()).filter((s) => s.split(' ').length >= 6),
  );
}

/** Türkçe küçük harfe çevirir (I→ı, İ→i) ve noktalamayı atar; şapkalı harfler korunur. */
export const cleanWord = (w: string) => w.toLocaleLowerCase('tr-TR').replace(/[^a-zçğıöşüâîû]/g, '');

/** Hedef kelime yalnızca bir satırda geçer ve en az 6 harflidir. */
export function generateLineScanRound(params: LineScanParams, index: number, rng: Rng, pool: string[] = allSentences()): LineScanRound {
  for (let attempt = 0; attempt < 200; attempt++) {
    const lines = shuffle(rng, pool).slice(0, params.lines);
    const wordLists = lines.map((l) => l.split(' ').map(cleanWord));
    const candidates: { word: string; line: number }[] = [];
    wordLists.forEach((ws, li) => {
      ws.forEach((w) => {
        if (w.length < 6) return;
        // Başka satırda kelimenin bir parçası olarak bile geçmemeli (ör. "kitap" / "kitaplar").
        const elsewhere = wordLists.some((other, oi) => oi !== li && other.some((o) => o.includes(w)));
        if (!elsewhere) candidates.push({ word: w, line: li });
      });
    });
    if (candidates.length > 0) {
      const pick = candidates[randomInt(rng, 0, candidates.length - 1)];
      return { index, lines, targetWord: pick.word, targetLine: pick.line };
    }
  }
  throw new Error('Satır taraması için uygun hedef bulunamadı');
}

export function summarizeLineScan(rounds: LineScanRound[], answers: (number | null)[], responseMs: (number | null)[]) {
  let correct = 0;
  rounds.forEach((r, i) => {
    if (answers[i] === r.targetLine) correct++;
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
