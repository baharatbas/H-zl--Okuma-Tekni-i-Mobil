/** Hafıza görevi: okunan metinde geçen kelimeleri geçmeyenlerin arasından seçme. */
import { cleanWord } from './exercises/lineScan';
import { Rng, shuffle } from './rng';

export interface MemoryOption {
  word: string;
  inText: boolean;
}

/** Her metinde geçebilen, hatırlamayı sınamayan sözcükler. */
const COMMON = new Set(['olabilir', 'ortaya', 'olmayan', 'olamayan', 'olarak', 'olduğu', 'yalnızca', 'böylece', 'birlikte', 'yerine', 'kendini', 'sağlar', 'yardım', 'önemli', 'zamanla', 'ardından', 'yeniden', 'herkes', 'çünkü', 'olmaktan', 'olmasını']);

const wordsOf = (body: string) => [...new Set(body.split(/\s+/).map(cleanWord).filter((w) => w.length >= 6 && !COMMON.has(w)))];

export function memoryOptions(body: string, otherBodies: string[], rng: Rng, perSide = 4): MemoryOption[] {
  const seen = shuffle(rng, wordsOf(body)).slice(0, perSide);
  // Ekleri farklı olan aynı kökler ("kitap" / "kitaplar") çeldirici sayılmaz.
  const stems = new Set(body.split(/\s+/).map((w) => cleanWord(w).slice(0, 4)));
  const others = shuffle(rng, wordsOf(otherBodies.join(' ')).filter((w) => !stems.has(w.slice(0, 4)))).slice(0, perSide);
  return shuffle(rng, [...seen.map((word) => ({ word, inText: true })), ...others.map((word) => ({ word, inText: false }))]);
}

/** Her kelime için doğru karar: metindeyse seçilmiş, değilse seçilmemiş olmalı. */
export function scoreMemory(options: MemoryOption[], selected: string[]): number {
  return options.filter((o) => o.inText === selected.includes(o.word)).length;
}
