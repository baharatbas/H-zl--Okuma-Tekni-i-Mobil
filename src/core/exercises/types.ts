/**
 * Egzersiz motoru ortak tipleri. Her egzersiz: ayar (settings) → tur (round) üretimi → cevap değerlendirmesi.
 * Göz takibi egzersizleri göz hareketini ÖLÇMEZ; görsel dikkat ve hız çalışmasıdır.
 */
export type ExerciseKey =
  | 'tracking'
  | 'zigzag_horizontal'
  | 'zigzag_vertical'
  | 'star_hunter'
  | 'peripheral_letters'
  | 'flash_numbers'
  | 'word_blocks'
  | 'scan_search'
  | 'skim_read'
  | 'synonym_match'
  | 'line_scan'
  | 'rsvp_repeat'
  | 'schulte';

export interface ExerciseSettings {
  /** 1 (kolay) – 5 (zor). */
  difficulty: number;
  /** Toplam oyun süresi için hedef (sn). Tur tabanlı egzersizlerde tur sayısını belirler. */
  durationSec: number;
  /** Hız ayarı: egzersize göre anlamı değişir (ms). Daha küçük = daha hızlı. */
  speedMs: number;
}

export interface ExerciseResult {
  /** Egzersiz puanı (doğru sayısına göre, 0..100). */
  score: number;
  /** Doğruluk (0..1). */
  accuracy: number;
  /** Ortalama tepki süresi (ms); yoksa null. */
  avgResponseMs: number | null;
  /** Gerçek oynama süresi (ms). */
  durationMs: number;
}

export interface ExerciseMeta {
  key: ExerciseKey;
  name: string;
  description: string;
  goal: string;
  /** Kısa okuma ipucu. */
  tip: string;
  /** Ionicons adı. */
  icon: string;
  /** Egzersizin vurgu rengi (hex). */
  color: string;
  /** "Nasıl oynanır" adımları. */
  howTo: string[];
  defaults: ExerciseSettings;
  speedLabel: string;
  speedRange: [number, number];
}

export function clampDifficulty(d: number): number {
  return Math.min(5, Math.max(1, Math.round(d)));
}
