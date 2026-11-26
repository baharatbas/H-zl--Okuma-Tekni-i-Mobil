/**
 * Kişisel kurs üretimi. Her "ders" üç adımdan oluşur: egzersiz → okuma → kısa test.
 * Adımlar sırayla açılır: bir adım tamamlanmadan sonraki adım kilitli kalır.
 */
import type { Level } from './levels';
import type { ExerciseKey } from './exercises/types';
import { TACTIC_PREFIX, TACTICS } from '../content/tactics';

export type LessonType = 'exercise' | 'reading' | 'test';

export interface LessonStep {
  orderIndex: number;
  type: LessonType;
  /** exercise → egzersiz anahtarı, reading/test → metin anahtarı (builtin key veya "text:<id>"). */
  contentRef: string;
  /** Hangi dersin (1'den başlar) parçası olduğu. */
  unit: number;
  difficulty: number;
}

/** Her seviye için egzersiz sırası ve kurs ünite sayısı. */
const UNIT_EXERCISES: Record<Level, ExerciseKey[][]> = {
  beginner: [['tracking', 'schulte'], ['zigzag_horizontal', 'scan_search'], ['star_hunter', 'synonym_match'], ['peripheral_letters', 'line_scan']],
  intermediate: [['tracking', 'zigzag_vertical'], ['star_hunter', 'word_blocks'], ['flash_numbers', 'schulte'], ['peripheral_letters', 'scan_search']],
  advanced: [['flash_numbers', 'word_blocks'], ['star_hunter', 'schulte'], ['skim_read', 'flash_numbers'], ['scan_search', 'skim_read'], ['rsvp_repeat', 'line_scan']],
};

/** Her ünitede okunacak builtin metin anahtarları (builtin-texts içindeki key'ler). */
const UNIT_TEXTS: Record<Level, string[]> = {
  beginner: ['builtin-sea', 'builtin-level-test', 'builtin-city', 'builtin-garden'],
  intermediate: ['builtin-history', 'builtin-science', 'builtin-travel'],
  advanced: ['builtin-economy', 'builtin-science', 'builtin-philosophy'],
};

/**
 * Temel ünitelerden sonra gelen taktik ünitelerinin okuma metinleri (TACTICS sırasıyla).
 * Taktik üniteleri sona eklenir; böylece süren kurslar ilerleme kaybetmeden uzar.
 */
const TACTIC_TEXTS: Record<Level, string[]> = {
  beginner: ['builtin-market', 'builtin-forest', 'builtin-walking', 'builtin-ants', 'builtin-tea', 'builtin-neighbours', 'builtin-seeds', 'builtin-saving', 'builtin-night-animals', 'builtin-morning-routine', 'builtin-volunteer', 'builtin-balcony-cat', 'builtin-cooking', 'builtin-letters', 'builtin-screen-break', 'builtin-curiosity', 'builtin-patience', 'builtin-shadow-play', 'builtin-maps', 'builtin-empathy', 'builtin-coral'],
  intermediate: ['builtin-sleep', 'builtin-river', 'builtin-museum', 'builtin-habits', 'builtin-listening', 'builtin-maps', 'builtin-migration', 'builtin-soil', 'builtin-coral', 'builtin-electricity', 'builtin-marbling', 'builtin-proverbs', 'builtin-magnet', 'builtin-senses', 'builtin-mistakes', 'builtin-gravity', 'builtin-theatre', 'builtin-water-states', 'builtin-simplicity', 'builtin-library-history', 'builtin-screen-break'],
  advanced: ['builtin-vaccine', 'builtin-glacier', 'builtin-architecture', 'builtin-attention', 'builtin-decisions', 'builtin-scientific-method', 'builtin-internet', 'builtin-slow-reading', 'builtin-volcano', 'builtin-microscope', 'builtin-storytelling', 'builtin-curiosity', 'builtin-empathy', 'builtin-mistakes', 'builtin-river', 'builtin-listening', 'builtin-habits', 'builtin-sleep', 'builtin-museum', 'builtin-patience', 'builtin-maps'],
};

/** Genel kurstaki toplam ünite sayısı (temel üniteler + taktik üniteleri). */
export const TOTAL_UNITS = 25;

export function buildCourse(level: Level): LessonStep[] {
  const steps: LessonStep[] = [];
  const exerciseUnits = UNIT_EXERCISES[level];
  const texts = UNIT_TEXTS[level];
  const difficulty = { beginner: 1, intermediate: 3, advanced: 5 }[level];

  exerciseUnits.forEach((exercises, i) => {
    const unit = i + 1;
    const textKey = texts[i % texts.length];
    const base = steps.length;
    exercises.forEach((key, j) => {
      steps.push({ orderIndex: base + j, type: 'exercise', contentRef: key, unit, difficulty });
    });
    const afterExercises = steps.length;
    steps.push({ orderIndex: afterExercises, type: 'reading', contentRef: textKey, unit, difficulty });
    steps.push({ orderIndex: afterExercises + 1, type: 'test', contentRef: textKey, unit, difficulty });
  });

  TACTICS.slice(0, TOTAL_UNITS - exerciseUnits.length).forEach((tactic, i) => {
    const unit = exerciseUnits.length + i + 1;
    const textKey = TACTIC_TEXTS[level][i];
    const add = (type: LessonType, contentRef: string) =>
      steps.push({ orderIndex: steps.length, type, contentRef, unit, difficulty });
    add('reading', `${TACTIC_PREFIX}${tactic.key}`);
    add('exercise', tactic.exercise);
    add('reading', textKey);
    add('test', textKey);
  });
  return steps;
}

/** Sıradaki kilidi açık, tamamlanmamış adımın indeksi; hepsi bitmişse null. */
export function nextUnlockedStep(
  steps: { orderIndex: number; isCompleted: boolean }[],
): number | null {
  const sorted = [...steps].sort((a, b) => a.orderIndex - b.orderIndex);
  const next = sorted.find((s) => !s.isCompleted);
  return next ? next.orderIndex : null;
}

/**
 * Bir adımın kilidi açık mı? İlk adım her zaman açıktır, diğerleri bir öncekinin tamamlanmasını bekler.
 * İstisna: taktik dersi ancak alıştırmasıyla birlikte tamamlanır; bu yüzden alıştırma, taktik açıldığında açılır.
 */
export function isStepUnlocked(
  steps: { orderIndex: number; isCompleted: boolean; contentRef?: string }[],
  orderIndex: number,
): boolean {
  if (orderIndex === 0) return true;
  const prev = steps.find((s) => s.orderIndex === orderIndex - 1);
  if (!prev) return false;
  if (prev.contentRef?.startsWith(TACTIC_PREFIX)) return isStepUnlocked(steps, prev.orderIndex);
  return prev.isCompleted;
}

export interface UnitMeta {
  title: string;
  goal: string;
}

/** Her seviyenin ünite başlıkları ve hedefleri (ünite numarası 1'den başlar). */
const UNIT_META: Record<Level, UnitMeta[]> = {
  beginner: [
    { title: 'Gözünü ısındır', goal: 'Hareket ve takip ile görsel dikkati açar.' },
    { title: 'Hızlı tarama', goal: 'Yatay tarama ve yakın kelime farkındalığını geliştirirsin.' },
    { title: 'Hızlı kavrama', goal: 'Kısa bakışlarla anlamı yakalamaya başlarsın.' },
    { title: 'Sayfayı tanı', goal: 'Çevredeki bilgiyi fark etme ve ilk okuma pratiği.' },
  ],
  intermediate: [
    { title: 'Dikkat ve ritim', goal: 'Takip ve dikey tarama ile okuma ritmini oturtur.' },
    { title: 'Kelime grupları', goal: 'Kelimeleri gruplayarak okumaya başlarsın.' },
    { title: 'Görüş genişliği', goal: 'Flaş ve çevresel görüşle algı alanını genişletirsin.' },
    { title: 'Tarama ustalığı', goal: 'Tarama ve satır aramada hızını artırırsın.' },
  ],
  advanced: [
    { title: 'Hızlı algı', goal: 'Yüksek hızda kısa bakışlarla bilgi almaya odaklanırsın.' },
    { title: 'Görüş ve odak', goal: 'Çevresel görüşü ve odağı birlikte çalıştırırsın.' },
    { title: 'Göz gezdirme', goal: 'Metni tarayarak ana fikri yakalamayı öğrenirsin.' },
    { title: 'Sistemli tarama', goal: 'Büyük sayfalarda hedefi hızla bulmayı pekiştirirsin.' },
    { title: 'Akıcı okuma', goal: 'Geri dönmeden akan bir okuma ritmi kurarsın.' },
  ],
};

export function unitMeta(level: Level, unit: number): UnitMeta {
  const tactic = TACTICS[unit - UNIT_META[level].length - 1];
  return UNIT_META[level][unit - 1] ?? (tactic ? { title: tactic.title, goal: tactic.goal } : { title: `Ünite ${unit}`, goal: '' });
}

/** Egzersiz adımında geçilmesi gereken zorluk seviyeleri. */
export const DIFFICULTY_LEVELS = [1, 2, 3, 4, 5];
/** Bir seviyenin geçilmiş sayılması için en düşük puan (sonuç ekranında 2 yıldız). */
export const PASS_SCORE = 60;

/** Henüz geçilmemiş en kolay seviye; hepsi geçildiyse null. */
export function nextDifficulty(passed: number[]): number | null {
  return DIFFICULTY_LEVELS.find((d) => !passed.includes(d)) ?? null;
}
