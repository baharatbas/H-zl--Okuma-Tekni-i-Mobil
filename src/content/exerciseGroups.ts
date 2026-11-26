import type { ExerciseKey } from '../core/exercises/types';

/** Egzersiz listesindeki gruplar. Her egzersiz tam olarak bir grupta yer alır. */
export const EXERCISE_GROUPS: { id: string; title: string; subtitle: string; keys: ExerciseKey[] }[] = [
  {
    id: 'eye',
    title: 'Takip ve ritim',
    subtitle: 'Görsel dikkat ve hız',
    keys: ['tracking', 'zigzag_horizontal', 'zigzag_vertical', 'rsvp_repeat'],
  },
  {
    id: 'vision',
    title: 'Görüş ve algı',
    subtitle: 'Tek bakışta daha çok gör',
    keys: ['schulte', 'star_hunter', 'peripheral_letters', 'flash_numbers', 'word_blocks'],
  },
  {
    id: 'reading',
    title: 'Okuma teknikleri',
    subtitle: 'Tarama, göz gezdirme, kelime',
    keys: ['scan_search', 'line_scan', 'skim_read', 'synonym_match'],
  },
];

/** Karttaki kısa açıklama. */
export const SHORT_SKILL: Record<ExerciseKey, string> = {
  tracking: 'Dikkat ve takip',
  zigzag_horizontal: 'Sağa sola hız',
  zigzag_vertical: 'Yukarı aşağı hız',
  rsvp_repeat: 'Akıcı okuma',
  schulte: 'Sayıları sırala',
  star_hunter: 'Renk ve sayı',
  peripheral_letters: 'Görme alanı',
  flash_numbers: 'Anlık algı',
  word_blocks: 'Gruplayarak okuma',
  scan_search: 'Harf tarama',
  line_scan: 'Satır bulma',
  skim_read: 'Ana fikri yakala',
  synonym_match: 'Kelime dağarcığı',
};
