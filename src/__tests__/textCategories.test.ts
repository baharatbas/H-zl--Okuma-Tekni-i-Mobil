import { BUILTIN_TEXTS } from '../content/builtinTexts';
import { categoryOf, filterTexts, textOfTheDay } from '../content/textCategories';

const rows = [
  { title: 'İpek Yolu', key: 'builtin-history', source: 'builtin' as const },
  { title: 'Yolların Hikâyesi', key: 'builtin-sea', source: 'builtin' as const },
  { title: 'Notlarım', key: null, source: 'user' as const },
];

describe('kütüphane kategorileri', () => {
  it('her hazır metnin kendi kategorisi var (varsayılana düşen yok)', () => {
    const counts = new Set(BUILTIN_TEXTS.map((t) => categoryOf({ key: t.key, source: 'builtin' })));
    expect(counts.size).toBe(5);
    expect(categoryOf({ key: null, source: 'user' })).toBe('mine');
  });
  it('arama Türkçe İ ve şapkalı harfleri doğru eşler', () => {
    expect(filterTexts(rows, 'ipek', 'all').map((r) => r.title)).toEqual(['İpek Yolu']);
    expect(filterTexts(rows, 'hikaye', 'all')).toHaveLength(1);
  });
  it('kategori ve arama birlikte uygulanır', () => {
    expect(filterTexts(rows, '', 'mine')).toHaveLength(1);
    expect(filterTexts(rows, 'yol', 'culture').map((r) => r.title)).toEqual(['İpek Yolu']);
  });
  it('günün metni gün içinde sabit, ertesi gün değişir', () => {
    expect(textOfTheDay(rows, '2026-11-26')).toBe(textOfTheDay(rows, '2026-11-26'));
    expect(textOfTheDay(rows, '2026-11-26')).not.toBe(textOfTheDay(rows, '2026-11-27'));
    expect(textOfTheDay([], '2026-11-26')).toBeNull();
  });
});
