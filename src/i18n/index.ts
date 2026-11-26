import { tr, Dict } from './tr';

export type Locale = 'tr';

/** Desteklenen diller. Yeni dil: aynı yapıda bir sözlük ekleyip buraya kaydedin. */
const locales: Record<Locale, Dict> = { tr };
let currentLocale: Locale = 'tr';

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

function lookup(dict: unknown, path: string): string | undefined {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as object)) return (acc as Record<string, unknown>)[key];
    return undefined;
  }, dict) as string | undefined;
}

/**
 * Çeviri. Anahtar nokta ile iç içe yolu gösterir: t('home.greeting').
 * `{değişken}` yer tutucuları `vars` ile doldurulur. Anahtar yoksa anahtarın kendisi döner.
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const raw = lookup(locales[currentLocale], key);
  if (typeof raw !== 'string') return key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name: string) => (name in vars ? String(vars[name]) : `{${name}}`));
}
