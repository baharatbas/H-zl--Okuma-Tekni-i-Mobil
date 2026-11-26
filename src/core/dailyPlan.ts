/**
 * Günlük antrenman: her gün 5 görev. Egzersiz türü güne ve geçmişe göre değişir,
 * zorluk son puanlara, metin uzunluğu son anlama oranına göre ayarlanır.
 */
import { LEVEL_PARAMS, Level } from './levels';
import type { ExerciseKey } from './exercises/types';
import { createRng, pickOne, Rng } from './rng';

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

export const ATTENTION: ExerciseKey[] = ['star_hunter', 'schulte', 'tracking', 'zigzag_horizontal', 'zigzag_vertical', 'peripheral_letters', 'scan_search', 'word_hunt', 'typo_find'];
export const RECOGNITION: ExerciseKey[] = ['word_blocks', 'flash_numbers', 'synonym_match', 'line_scan', 'rsvp_repeat', 'word_find', 'phrase_group', 'word_memory', 'missing_word', 'real_or_fake', 'true_false', 'maze_read', 'word_chain'];

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
}

/** Son iki puana göre zorluk: başarılıysa bir artar, zorlanıyorsa bir azalır. */
export function adaptDifficulty(history: DailyInput['history'], key: string, level: Level): number {
  const mine = history.filter((h) => h.key === key).slice(0, 2);
  if (mine.length === 0) return LEVEL_PARAMS[level].exerciseDifficulty;
  const avg = mine.reduce((sum, h) => sum + h.score, 0) / mine.length;
  const step = avg >= 85 ? 1 : avg < 60 ? -1 : 0;
  return Math.min(5, Math.max(1, mine[0].difficulty + step));
}

/** Dün yapılanı atlar; uzun süredir oynanmayan (ya da hiç oynanmamış) üç aday arasından seçer. */
function pickExercise(rng: Rng, pool: ExerciseKey[], input: DailyInput): ExerciseKey {
  const rank = (key: string) => {
    const i = input.history.findIndex((h) => h.key === key);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  const candidates = pool
    .filter((k) => !input.previousRefs.includes(k))
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
  const attention = pickExercise(rng, ATTENTION, input);
  const recognition = pickExercise(rng, RECOGNITION, input);
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
  return tasks.map((task, position) => ({ ...task, position, xp: XP[task.kind] }));
}
