/** Uygulama ayarları. Kalıcı olarak user_profile.settings_json içinde saklanır. */
import type { Segment } from './segments';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ReadingMode = 'word' | 'chunk' | 'block';
export type LearningMode = 'smart' | 'free';

export interface AppSettings {
  theme: ThemeMode;
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  /** Dinamik yazı boyutu çarpanı (1 = normal). */
  fontScale: number;
  dailyGoalMinutes: number;
  reminderEnabled: boolean;
  reminderHour: number;
  readingWpm: number;
  readingFontSize: number;
  lineSpacing: number;
  readingUnit: ReadingMode;
  chunkSize: number;
  /** İlk açılış akışı tamamlandı mı? (bir kez gösterilir) */
  onboardingDone: boolean;
  /** Kullanıcı grubu: öğrenci ('exam'), çalışan, kitap okuru ya da genel ('self'). */
  purpose: Segment | null;
  /** Sınav yolunda hedeflenen sınav. */
  examTarget: 'lgs' | 'tyt' | 'kpss' | 'uni';
  /** İsteğe bağlı hitap adı; yalnızca bu cihazda saklanır. */
  displayName: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  hapticsEnabled: true,
  reducedMotion: false,
  fontScale: 1,
  dailyGoalMinutes: 10,
  reminderEnabled: false,
  reminderHour: 20,
  readingWpm: 250,
  readingFontSize: 22,
  lineSpacing: 1.5,
  readingUnit: 'chunk',
  chunkSize: 2,
  onboardingDone: false,
  purpose: null,
  examTarget: 'tyt',
  displayName: '',
};

/** Bilinmeyen/bozuk JSON'u güvenle birleştirir: eksik alanlar varsayılanla tamamlanır. */
export function parseSettings(json: string | null | undefined): AppSettings {
  if (!json) return { ...DEFAULT_SETTINGS };
  try {
    const parsed = JSON.parse(json) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
