/** Hazır metinlerin konu kategorileri ve arama/filtre yardımcıları. */
import { LIBRARY_TEXTS } from './library';

export type CategoryKey = 'nature' | 'science' | 'culture' | 'life' | 'thought' | 'work' | 'mine';

export const CATEGORIES: Record<CategoryKey, { label: string; icon: string; color: string }> = {
  nature: { label: 'Doğa', icon: 'leaf-outline', color: '#3D8B5A' },
  science: { label: 'Bilim', icon: 'planet-outline', color: '#3B75AE' },
  culture: { label: 'Kültür', icon: 'color-palette-outline', color: '#B8605A' },
  life: { label: 'Yaşam', icon: 'cafe-outline', color: '#B07A2A' },
  thought: { label: 'Düşünce', icon: 'bulb-outline', color: '#76609E' },
  work: { label: 'İş belgeleri', icon: 'briefcase-outline', color: '#4A6A8A' },
  mine: { label: 'Metinlerim', icon: 'create-outline', color: '#1F6F78' },
};

const BY_KEY: Record<string, CategoryKey> = {
  'builtin-level-test': 'life',
  'builtin-sea': 'nature',
  'builtin-city': 'life',
  'builtin-garden': 'nature',
  'builtin-history': 'culture',
  'builtin-science': 'science',
  'builtin-travel': 'culture',
  'builtin-economy': 'life',
  'builtin-philosophy': 'thought',
  'builtin-space': 'science',
  'builtin-coffee': 'life',
  'builtin-bridges': 'culture',
  'builtin-music': 'culture',
  'builtin-recycling': 'nature',
  'builtin-bees': 'nature',
  'builtin-weather': 'science',
  'builtin-language': 'thought',
  'builtin-chess': 'thought',
  'builtin-bread': 'life',
  'builtin-time': 'thought',
  ...Object.fromEntries(LIBRARY_TEXTS.map((text) => [text.key, text.category])),
};

export function categoryOf(text: { key: string | null; source: 'builtin' | 'user' }): CategoryKey {
  if (text.source === 'user') return 'mine';
  return (text.key && BY_KEY[text.key]) || 'life';
}

const fold = (s: string) => s.toLocaleLowerCase('tr-TR').replace(/â/g, 'a').replace(/î/g, 'i').trim();

/** Başlıkta Türkçe büyük/küçük harfe duyarsız arama ve kategori filtresi. */
export function filterTexts<T extends { title: string; key: string | null; source: 'builtin' | 'user' }>(
  texts: T[],
  query: string,
  category: CategoryKey | 'all',
): T[] {
  const q = fold(query);
  return texts.filter(
    (text) => (category === 'all' || categoryOf(text) === category) && (q === '' || fold(text.title).includes(q)),
  );
}

/** Güne göre değişen, gün içinde sabit kalan öneri. `date` "YYYY-MM-DD" biçimindedir. */
export function textOfTheDay<T>(texts: T[], date: string): T | null {
  if (texts.length === 0) return null;
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
  return texts[day % texts.length];
}
