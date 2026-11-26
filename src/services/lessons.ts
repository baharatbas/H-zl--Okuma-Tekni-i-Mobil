import { repositories } from '../repositories';
import type { LessonRow } from '../repositories';
import { findBuiltinText } from '../content/builtinTexts';
import { EXERCISES } from '../core/exercises/registry';
import type { ExerciseKey } from '../core/exercises/types';
import { t } from '../i18n';
import { examRef } from '../core/exam/course';
import { TECHNIQUES } from '../content/exam/techniques';
import { lessonNote } from '../content/lessonNotes';
import { findTactic } from '../content/tactics';

/** Kurs adımının ekranda görünen başlığı. */
export function lessonTitle(lesson: LessonRow): string {
  const tactic = findTactic(lesson.contentRef);
  if (tactic) return t('course.lessonTactic', { title: tactic.title });
  const exam = examRef(lesson.contentRef);
  if (exam) return t(exam.kind === 'tech' ? 'exam.lessonTech' : 'exam.lessonPractice', { type: TECHNIQUES[exam.type].title });
  if (lesson.type === 'exercise') return EXERCISES[lesson.contentRef as ExerciseKey]?.name ?? lesson.contentRef;
  const title = findBuiltinText(lesson.contentRef)?.title ?? lesson.contentRef;
  return lesson.type === 'reading' ? title : `${t('course.stepTest')}: ${title}`;
}

/**
 * Kurs adımının rotası. `lesson` parametresi kurs sırasını taşır; oyun/okuma/test bitince
 * ilgili adım tamamlanır.
 */
export function lessonRoute(lesson: LessonRow): string {
  const tactic = findTactic(lesson.contentRef);
  if (tactic) return `/tactic/${tactic.key}?lesson=${lesson.orderIndex}`;
  const exam = examRef(lesson.contentRef);
  if (exam?.kind === 'tech') return `/paragraph/technique/${exam.type}?lesson=${lesson.orderIndex}`;
  if (exam) return `/paragraph/practice?type=${exam.type}&lesson=${lesson.orderIndex}`;
  if (lesson.type === 'exercise') return `/exercise/${lesson.contentRef}?lesson=${lesson.orderIndex}`;
  const text = repositories().texts.getByKey(lesson.contentRef);
  if (!text) return '/(tabs)/course';
  const base = lesson.type === 'reading' ? '/reader' : '/test';
  return `${base}/${text.id}?lesson=${lesson.orderIndex}`;
}

export function lessonStepIcon(type: LessonRow['type']): 'play-circle-outline' | 'book-outline' | 'checkmark-done-outline' {
  return type === 'exercise' ? 'play-circle-outline' : type === 'reading' ? 'book-outline' : 'checkmark-done-outline';
}

/** Adımın öğrenme hedefi: egzersiz için kısa açıklama, okuma/test için metin hedefi. */
export function lessonGoal(lesson: LessonRow): string {
  const tactic = findTactic(lesson.contentRef);
  if (tactic) return tactic.goal;
  const exam = examRef(lesson.contentRef);
  if (exam) return TECHNIQUES[exam.type].goal;
  if (lesson.type === 'exercise') return EXERCISES[lesson.contentRef as ExerciseKey]?.goal ?? '';
  return lessonNote(lesson.contentRef)?.objective ?? '';
}
