/**
 * Kişisel kurs üretimi. Her "ders" üç adımdan oluşur: egzersiz → okuma → kısa test.
 * Adımlar sırayla açılır: bir adım tamamlanmadan sonraki adım kilitli kalır.
 */
import type { Level } from './levels';
import type { ExerciseKey } from './exercises/types';

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

/** Bir adımın kilidi açık mı? İlk adım her zaman açıktır, diğerleri bir öncekinin tamamlanmasını bekler. */
export function isStepUnlocked(
  steps: { orderIndex: number; isCompleted: boolean }[],
  orderIndex: number,
): boolean {
  if (orderIndex === 0) return true;
  const prev = steps.find((s) => s.orderIndex === orderIndex - 1);
  return prev ? prev.isCompleted : false;
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
  return UNIT_META[level][unit - 1] ?? { title: `Ünite ${unit}`, goal: '' };
}

/** Egzersiz adımında geçilmesi gereken zorluk seviyeleri. */
export const DIFFICULTY_LEVELS = [1, 2, 3, 4, 5];
/** Bir seviyenin geçilmiş sayılması için en düşük puan (sonuç ekranında 2 yıldız). */
export const PASS_SCORE = 60;

/** Henüz geçilmemiş en kolay seviye; hepsi geçildiyse null. */
export function nextDifficulty(passed: number[]): number | null {
  return DIFFICULTY_LEVELS.find((d) => !passed.includes(d)) ?? null;
}
