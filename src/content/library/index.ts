import { CULTURE } from './culture';
import { LIFE } from './life';
import { NATURE } from './nature';
import { SCIENCE } from './science';
import { THOUGHT } from './thought';
import { WORK } from './work';
import { LibraryEntry, toLibraryTexts } from './types';

/** Kütüphanenin ek metinleri: beş konudan onar metin (karışık sıralı) ve iş belgeleri. */
const groups: LibraryEntry[][] = [
  toLibraryTexts('nature', NATURE),
  toLibraryTexts('science', SCIENCE),
  toLibraryTexts('culture', CULTURE),
  toLibraryTexts('life', LIFE),
  toLibraryTexts('thought', THOUGHT),
];

export const LIBRARY_TEXTS: LibraryEntry[] = [...groups[0].flatMap((_, i) => groups.map((g) => g[i])), ...toLibraryTexts('work', WORK)];
