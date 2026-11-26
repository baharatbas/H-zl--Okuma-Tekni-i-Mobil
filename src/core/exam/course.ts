/**
 * Sınav kursu: her soru tipi bir ünite → göz/okuma egzersizi, teknik dersi, süreli soru çalışması.
 * Mevcut kurs tablosu kullanılır: teknik dersi 'reading' ("tech:<tip>"), soru çalışması 'test' ("para:<tip>").
 */
import type { LessonStep } from '../course';
import type { Level } from '../levels';
import { QuestionType, QUESTION_TYPES, TYPE_EXERCISE } from './types';

export const TECH_PREFIX = 'tech:';
export const PARA_PREFIX = 'para:';

export function buildExamCourse(level: Level): LessonStep[] {
  const difficulty = { beginner: 1, intermediate: 3, advanced: 5 }[level];
  const steps: LessonStep[] = [];
  QUESTION_TYPES.forEach((type, i) => {
    const unit = i + 1;
    const add = (kind: LessonStep['type'], contentRef: string) =>
      steps.push({ orderIndex: steps.length, type: kind, contentRef, unit, difficulty });
    add('exercise', TYPE_EXERCISE[type]);
    add('reading', `${TECH_PREFIX}${type}`);
    add('test', `${PARA_PREFIX}${type}`);
  });
  return steps;
}

/** "tech:main" / "para:flow" gibi bir referanstan soru tipini çıkarır. */
export function examRef(contentRef: string): { kind: 'tech' | 'para'; type: QuestionType } | null {
  const kind = contentRef.startsWith(TECH_PREFIX) ? 'tech' : contentRef.startsWith(PARA_PREFIX) ? 'para' : null;
  if (!kind) return null;
  const type = contentRef.slice(5) as QuestionType;
  return QUESTION_TYPES.includes(type) ? { kind, type } : null;
}

/** Kurs, seçili yola uymuyor mu? */
export function isTrackMismatch(lessons: { contentRef: string }[], wantsExam: boolean): boolean {
  return lessons.some((l) => examRef(l.contentRef) !== null) !== wantsExam;
}
