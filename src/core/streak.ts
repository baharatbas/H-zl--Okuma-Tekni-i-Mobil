/**
 * Günlük hedef ve seri (streak) hesabı. Tarihler "YYYY-MM-DD" (yerel gün) biçimindedir.
 */
export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null;
}

export const EMPTY_STREAK: StreakState = { currentStreak: 0, bestStreak: 0, lastActiveDate: null };

/** Bir tarihten belirli gün sayısı çıkarır (YYYY-MM-DD). */
export function shiftDate(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

/** Yerel tarihi YYYY-MM-DD olarak verir. */
export function localDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Aktivite işaretlendiğinde seriyi günceller.
 * - Aynı gün: değişmez.
 * - Dünden devam: seri +1.
 * - Daha eski: seri 1'e döner.
 */
export function registerActivity(state: StreakState, today: string): StreakState {
  if (state.lastActiveDate === today) return state;
  const continues = state.lastActiveDate !== null && state.lastActiveDate === shiftDate(today, -1);
  const currentStreak = continues ? state.currentStreak + 1 : 1;
  return {
    currentStreak,
    bestStreak: Math.max(state.bestStreak, currentStreak),
    lastActiveDate: today,
  };
}

/**
 * Bugün kontrol edildiğinde görünen seri: son aktivite bugün veya dün değilse seri kırılmıştır (0).
 */
export function effectiveStreak(state: StreakState, today: string): number {
  if (state.lastActiveDate === null) return 0;
  if (state.lastActiveDate === today || state.lastActiveDate === shiftDate(today, -1)) {
    return state.currentStreak;
  }
  return 0;
}

/** Günlük hedef ilerlemesi (0..1). */
export function goalProgress(completedMinutes: number, targetMinutes: number): number {
  if (targetMinutes <= 0) return 0;
  return Math.min(1, Math.max(0, completedMinutes / targetMinutes));
}
