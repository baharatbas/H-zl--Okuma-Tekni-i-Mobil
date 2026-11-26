/**
 * Hızlı Oku yardımcıları: metni kelime veya parça (chunk) olarak bölme ve
 * hız ayarına göre her parçanın ekranda kalma süresi.
 */

export type ReadingMode = 'word' | 'chunk' | 'block';

export interface ReadingChunk {
  text: string;
  /** Bu parçanın gösterilme süresi (ms). */
  durationMs: number;
}

/** WPM'e göre bir kelimenin süresi (ms). */
export function msPerWord(wpm: number): number {
  return wpm > 0 ? 60_000 / wpm : 0;
}

/**
 * Metni `size` kelimelik parçalara böler. Her parçanın süresi, içindeki kelime sayısı × msPerWord.
 * Kelime modunda size = 1, parça modunda 2-4 arası kullanılır.
 */
export function chunkText(text: string, wpm: number, size = 1): ReadingChunk[] {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const step = Math.max(1, Math.floor(size));
  const per = msPerWord(wpm);
  const chunks: ReadingChunk[] = [];
  for (let i = 0; i < words.length; i += step) {
    const slice = words.slice(i, i + step);
    chunks.push({ text: slice.join(' '), durationMs: Math.round(per * slice.length) });
  }
  return chunks;
}

/**
 * Blok okuma: metin cümlelere bölünür, her blok (cümle) kullanıcının seçtiği hızla
 * ilerler. Cümle sonu noktalama (. ! ? …) ile ayrılır.
 */
export function blockChunks(text: string, wpm: number): ReadingChunk[] {
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return sentences.map((s) => {
    const words = s.split(' ').length;
    return { text: s, durationMs: Math.round(msPerWord(wpm) * words) };
  });
}

/** Toplam süre (ms). */
export function totalDuration(chunks: ReadingChunk[]): number {
  return chunks.reduce((sum, c) => sum + c.durationMs, 0);
}
