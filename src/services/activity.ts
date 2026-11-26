import { repositories } from '../repositories';
import { localDateString } from '../core/streak';
import { getSettings } from '../store/appStore';

/**
 * Okuma / egzersiz / test süresini bugünün hedefine ekler ve seriyi günceller.
 * Dakika cinsinden çağrılır; küçük süreler (0 dk) yine de seriyi işaretler.
 */
export function recordActivity(durationMs: number) {
  const minutes = Math.max(0, durationMs / 60_000);
  return repositories().progress.addActivity(
    localDateString(),
    Math.round(minutes * 10) / 10,
    getSettings().dailyGoalMinutes,
  );
}
