/**
 * Ölçüm kuralları: eşdeğer metin seçimi, şüpheli ölçümler, birden çok metnin birleştirilmesi
 * ve hız ile anlamanın birlikte değerlendirilmesi.
 */
import { comprehensionRate, computeWpm, countWords, effectiveWpm } from './metrics';
import { Rng, shuffle } from './rng';

export interface TextProfile {
  words: number;
  wordsPerSentence: number;
  syllablesPerWord: number;
}

/** Türkçede her ünlü bir hecedir. */
export function textProfile(body: string): TextProfile {
  const words = countWords(body);
  const sentences = body.split(/[.!?…]+/).filter((s) => s.trim().length > 0).length;
  const syllables = (body.match(/[aeıioöuüâîûAEIİOÖUÜÂÎÛ]/g) ?? []).length;
  return { words, wordsPerSentence: words / Math.max(1, sentences), syllablesPerWord: syllables / Math.max(1, words) };
}

/**
 * Uzunluğu ve basit okunabilirlik ölçüleri ortancaya en yakın metinler.
 * Bu yaklaşık bir eşdeğerliktir; metinler okurlar üzerinde kalibre edilmemiştir.
 */
export function equivalentPool<T extends { body: string }>(texts: T[], size = 24): T[] {
  const rows = texts.map((text) => ({ text, p: textProfile(text.body) }));
  const keys = ['words', 'wordsPerSentence', 'syllablesPerWord'] as const;
  const median = (k: (typeof keys)[number]) => [...rows.map((r) => r.p[k])].sort((a, b) => a - b)[Math.floor(rows.length / 2)];
  const mid = { words: median('words'), wordsPerSentence: median('wordsPerSentence'), syllablesPerWord: median('syllablesPerWord') };
  const distance = (p: TextProfile) => keys.reduce((sum, k) => sum + Math.abs(p[k] - mid[k]) / (mid[k] || 1), 0);
  return rows
    .sort((a, b) => distance(a.p) - distance(b.p))
    .slice(0, size)
    .map((r) => r.text);
}

export const BASELINE_TEXTS = 3;

/** Başlangıç testi için daha önce görülmemiş eşdeğer metinler; yetmezse görülenlerle tamamlanır. */
export function pickBaseline<T extends { key: string; body: string }>(texts: T[], seen: string[], rng: Rng): T[] {
  const pool = shuffle(rng, equivalentPool(texts));
  return [...pool.filter((t) => !seen.includes(t.key)), ...pool.filter((t) => seen.includes(t.key))].slice(0, BASELINE_TEXTS);
}

export type MeasurementFlag = 'too_fast' | 'too_slow' | 'skipped' | 'low_comp' | 'seen' | 'interrupted';

/** Ölçüm metni başına soru sayısı; daha az soruluk metin ölçüm havuzuna girmez. */
export const MEASUREMENT_MIN_QUESTIONS = 5;

/** Bu hızın üstünde hiç soru doğru değilse metin büyük olasılıkla okunmamıştır. */
export const SKIM_WPM = 300;
/** Bu hızın üstü ölçüm hatası sayılır; grafiğe girmez. */
export const FAST_LIMIT_WPM = 600;
/** Bu hızın altı yalnızca incelemeye alınır; tek başına dışlanmaz (zor metin ya da ara olabilir). */
export const SLOW_LIMIT_WPM = 40;

/** Bu nedenlerden biri varsa ölçüm grafiğe ve karşılaştırmaya alınmaz; geçmişte yine saklanır. */
export const EXCLUDING_FLAGS: MeasurementFlag[] = ['too_fast', 'skipped', 'seen', 'interrupted'];

/**
 * Ölçüm kontrolü. Hiçbir ölçüm silinmez; neden işaretlenir.
 * - Çok hızlı (600+): grafik dışı.
 * - Yavaş (40-): incelemeye alınır, grafikte kalır.
 * - Hızlı (300+) ve hiç doğru yok: grafik dışı. Hızlı ve az doğru (%1-39): anlama uyarısı, grafikte kalır.
 * - Daha önce okunmuş metin ve arka plana geçen okuma: grafik dışı.
 */
export function measurementFlags(m: { wpm: number; comprehension: number; seenBefore: boolean; interrupted?: boolean }): MeasurementFlag[] {
  const flags: MeasurementFlag[] = [];
  if (m.wpm > FAST_LIMIT_WPM) flags.push('too_fast');
  if (m.wpm < SLOW_LIMIT_WPM) flags.push('too_slow');
  if (m.wpm > SKIM_WPM && m.comprehension === 0) flags.push('skipped');
  else if (m.wpm > SKIM_WPM && m.comprehension < 0.4) flags.push('low_comp');
  if (m.seenBefore) flags.push('seen');
  if (m.interrupted) flags.push('interrupted');
  return flags;
}

export const isExcluded = (flags: MeasurementFlag[]) => flags.some((f) => EXCLUDING_FLAGS.includes(f));

/** Birkaç metnin ortak sonucu: toplam kelime / toplam süre ve toplam doğru / toplam soru. */
export function combineMeasurements(parts: { wordCount: number; durationMs: number; correctCount: number; totalCount: number }[]) {
  const sum = (f: (p: (typeof parts)[number]) => number) => parts.reduce((a, p) => a + f(p), 0);
  const correct = sum((p) => p.correctCount);
  const total = sum((p) => p.totalCount);
  const wpm = computeWpm(sum((p) => p.wordCount), sum((p) => p.durationMs));
  const comprehension = comprehensionRate(correct, total);
  return { wpm, comprehension, correct, total, effective: effectiveWpm(wpm, comprehension) };
}

export const COMPREHENSION_TARGET = 0.8;
/** Hız en az %10 artarken anlama en az 15 puan düşerse uyarılır. */
export function speedCostsComprehension(previous: { wpm: number; comprehension: number } | undefined, current: { wpm: number; comprehension: number }): boolean {
  if (!previous) return false;
  return current.wpm >= previous.wpm * 1.1 && previous.comprehension - current.comprehension >= 0.15;
}
