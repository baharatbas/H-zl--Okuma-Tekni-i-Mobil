/**
 * Okuma hızı ve anlama metrikleri. Tüm fonksiyonlar saf (side-effect yok) ve test edilebilir.
 */

/**
 * Sayım standardı: boşluk/satır sonu ile ayrılan ve en az bir harf ya da rakam içeren her parça
 * bir kelimedir. Tek başına duran noktalama (—, …) sayılmaz; "Ankara'dan" ve "250" birer kelimedir.
 */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/**
 * WPM (kelime/dakika) = kelime sayısı / (süre dakika cinsinden).
 * Süre sıfır veya negatifse 0 döner (bölme hatası olmaz).
 */
export function computeWpm(wordCount: number, durationMs: number): number {
  if (durationMs <= 0 || wordCount <= 0) return 0;
  return wordCount / (durationMs / 60_000);
}

/** Anlama oranı = doğru cevap / toplam soru (0..1). Soru yoksa 0. */
export function comprehensionRate(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, correct / total));
}

/** Yüzde olarak gösterim için yuvarlanmış anlama oranı (0..100). */
export function comprehensionPercent(correct: number, total: number): number {
  return Math.round(comprehensionRate(correct, total) * 100);
}

/** Doğruluk-düzeltilmiş hız: WPM × anlama oranı. Seviye tespitinde kullanılır. */
export function effectiveWpm(wpm: number, comprehension: number): number {
  return wpm * comprehension;
}

/** Egzersiz doğruluğu (0..1). Deneme sayısı 0 ise 0. */
export function accuracy(correct: number, attempts: number): number {
  return comprehensionRate(correct, attempts);
}

/** Grafiğe alınacak okuma hızı sınırları (kelime/dk). Dışındakiler yanlış ölçüm sayılır. */
export const MIN_PLAUSIBLE_WPM = 20;
export const MAX_PLAUSIBLE_WPM = 1200;
