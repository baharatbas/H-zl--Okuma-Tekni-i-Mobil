/**
 * Günlük antrenman: her gün 5 görev. Egzersiz türü güne ve geçmişe göre değişir,
 * zorluk son puanlara, metin uzunluğu son anlama oranına göre ayarlanır.
 */
import { LEVEL_PARAMS, Level } from './levels';
import type { ExerciseKey } from './exercises/types';
import { createRng, pickOne, Rng } from './rng';
import { Segment, SEGMENTS } from './segments';

export type DailyKind = 'attention' | 'recognition' | 'fluency' | 'comprehension' | 'memory';

export interface DailyTask {
  position: number;
  kind: DailyKind;
  /** Egzersiz görevlerinde egzersiz anahtarı, diğerlerinde metin anahtarı. */
  ref: string;
  difficulty: number;
  minutes: number;
  xp: number;
}

export const ATTENTION: ExerciseKey[] = SEGMENTS.self.attention;
export const RECOGNITION: ExerciseKey[] = SEGMENTS.self.recognition;

/** Seçilebilen günlük çalışma süreleri (dk). */
export const DAILY_MINUTES = [5, 10, 15, 20] as const;

export const XP: Record<DailyKind, number> = { attention: 20, recognition: 20, fluency: 30, comprehension: 30, memory: 20 };

export interface DailyInput {
  date: string;
  level: Level;
  /** Egzersiz oturumları, en yeniden eskiye. */
  history: { key: string; difficulty: number; score: number }[];
  /** Son testlerin ortalama anlama oranı (0–1); test yoksa null. */
  comprehension: number | null;
  texts: { key: string; words: number }[];
  /** Daha önce okunmuş ya da testi çözülmüş metinler. */
  seenTexts: string[];
  /** Bir önceki antrenmanın görev referansları; art arda tekrar edilmez. */
  previousRefs: string[];
  /** Kullanıcı grubu; verilmezse genel. */
  segment?: Segment;
  /** Günlük süre; verilmezse 10 dk. */
  minutes?: number;
}

/** Son iki puana göre zorluk: başarılıysa bir artar, zorlanıyorsa bir azalır. */
export function adaptDifficulty(history: DailyInput['history'], key: string, level: Level): number {
  const mine = history.filter((h) => h.key === key).slice(0, 2);
  if (mine.length === 0) return LEVEL_PARAMS[level].exerciseDifficulty;
  const avg = mine.reduce((sum, h) => sum + h.score, 0) / mine.length;
  const step = avg >= 85 ? 1 : avg < 60 ? -1 : 0;
  return Math.min(5, Math.max(1, mine[0].difficulty + step));
}

/**
 * Dün yapılanı atlar; uzun süredir oynanmayan (ya da hiç oynanmamış) üç aday arasından seçer.
 * Küçük havuzlarda dünden başka seçenek kalmazsa yalnızca bugün seçilenler dışlanır.
 */
function pickExercise(rng: Rng, pool: ExerciseKey[], input: DailyInput, today: string[] = []): ExerciseKey {
  const rank = (key: string) => {
    const i = input.history.findIndex((h) => h.key === key);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  const open = pool.filter((k) => !today.includes(k));
  const fresh = open.filter((k) => !input.previousRefs.includes(k));
  const candidates = (fresh.length > 0 ? fresh : open)
    .map((k) => ({ k, rank: rank(k), tie: rng() }))
    .sort((a, b) => b.rank - a.rank || a.tie - b.tie)
    .slice(0, 3);
  return pickOne(rng, candidates).k;
}

function pickText(rng: Rng, input: DailyInput, exclude: string[]): { key: string; words: number } {
  const open = input.texts.filter((x) => !exclude.includes(x.key));
  const unseen = open.filter((x) => !input.seenTexts.includes(x.key));
  const pool = [...(unseen.length > 0 ? unseen : open)].sort((a, b) => a.words - b.words);
  const third = Math.max(1, Math.ceil(pool.length / 3));
  const c = input.comprehension;
  if (c !== null && c < 0.6) return pickOne(rng, pool.slice(0, third));
  if (c !== null && c >= 0.8) return pickOne(rng, pool.slice(-third));
  return pickOne(rng, pool);
}

export function buildDailyPlan(input: DailyInput): DailyTask[] {
  const rng = createRng(Number(input.date.replace(/-/g, '')));
  const wpm = LEVEL_PARAMS[input.level].defaultReadingWpm;
  const group = SEGMENTS[input.segment ?? 'self'];
  const attention = pickExercise(rng, group.attention, input);
  const recognition = pickExercise(rng, group.recognition, input, [attention]);
  // Akıcılık ve test ayrı metin kullanır: aynı metni iki kez okumak ölçülen hızı şişirirdi.
  const fluency = pickText(rng, input, input.previousRefs);
  const test = pickText(rng, input, [...input.previousRefs, fluency.key]);
  const base = LEVEL_PARAMS[input.level].exerciseDifficulty;
  const tasks: Omit<DailyTask, 'position' | 'xp'>[] = [
    { kind: 'attention', ref: attention, difficulty: adaptDifficulty(input.history, attention, input.level), minutes: 2 },
    { kind: 'recognition', ref: recognition, difficulty: adaptDifficulty(input.history, recognition, input.level), minutes: 2 },
    { kind: 'fluency', ref: fluency.key, difficulty: base, minutes: Math.ceil(fluency.words / wpm) + 1 },
    { kind: 'comprehension', ref: test.key, difficulty: base, minutes: Math.ceil(test.words / wpm) + 2 },
    { kind: 'memory', ref: test.key, difficulty: base, minutes: 2 },
  ];
  // Süreye göre görev sayısı: 5 dk → 2, 10 → 5, 15 → 7, 20 → 9.
  const target = input.minutes ?? 10;
  let chosen = tasks;
  if (target <= 5) chosen = [tasks[0], tasks[3]];
  else if (target > 10) {
    const attention2 = pickExercise(rng, group.attention, input, [attention, recognition]);
    const recognition2 = pickExercise(rng, group.recognition, input, [attention, recognition, attention2]);
    const more: typeof tasks = [
      { kind: 'attention', ref: attention2, difficulty: adaptDifficulty(input.history, attention2, input.level), minutes: 2 },
      { kind: 'recognition', ref: recognition2, difficulty: adaptDifficulty(input.history, recognition2, input.level), minutes: 2 },
    ];
    if (target > 15) {
      const fluency2 = pickText(rng, input, [...input.previousRefs, fluency.key, test.key]);
      const attention3 = pickExercise(rng, group.attention, input, [attention, recognition, attention2, recognition2]);
      more.push(
        { kind: 'fluency', ref: fluency2.key, difficulty: base, minutes: Math.ceil(fluency2.words / wpm) + 1 },
        { kind: 'attention', ref: attention3, difficulty: adaptDifficulty(input.history, attention3, input.level), minutes: 2 },
      );
    }
    chosen = [...tasks, ...more];
  }
  return chosen.map((task, position) => ({ ...task, position, xp: XP[task.kind] }));
}
