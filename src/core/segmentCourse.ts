/** Çalışan ve kitap okuru kursları: her ünite taktik → alıştırma → okuma → test. */
import type { LessonStep, LessonType } from './course';
import type { Level } from './levels';
import type { ExerciseKey } from './exercises/types';
import { TACTIC_PREFIX } from '../content/tactics';

type Unit = [tactic: string, exercise: ExerciseKey, text: string];

const UNITS: Record<'work' | 'books', Unit[]> = {
  work: [
    ['preview', 'skim_read', 'builtin-internet'],
    ['skim-scan', 'scan_answer', 'builtin-electricity'],
    ['signals', 'connector', 'builtin-decisions'],
    ['recall', 'main_idea', 'builtin-attention'],
    ['regression', 'true_false', 'builtin-scientific-method'],
    ['chunking', 'sentence_order', 'builtin-listening'],
  ],
  books: [
    ['pointer', 'pacer_read', 'builtin-storytelling'],
    ['chunking', 'phrase_group', 'builtin-library-history'],
    ['regression', 'rsvp_repeat', 'builtin-letters'],
    ['inner-voice', 'maze_read', 'builtin-proverbs'],
    ['recall', 'sentence_order', 'builtin-theatre'],
    ['preview', 'missing_word', 'builtin-slow-reading'],
  ],
};

export function buildSegmentCourse(segment: 'work' | 'books', level: Level): LessonStep[] {
  const difficulty = { beginner: 1, intermediate: 3, advanced: 5 }[level];
  const steps: LessonStep[] = [];
  UNITS[segment].forEach(([tactic, exercise, text], i) => {
    const add = (type: LessonType, contentRef: string) => steps.push({ orderIndex: steps.length, type, contentRef, unit: i + 1, difficulty });
    add('reading', `${TACTIC_PREFIX}${tactic}`);
    add('exercise', exercise);
    add('reading', text);
    add('test', text);
  });
  return steps;
}

/** Kayıtlı kursun hangi gruba ait olduğunu ilk adımlarından anlar. */
export function courseSegment(lessons: { contentRef: string }[]): 'exam' | 'work' | 'books' | 'self' {
  if (lessons.some((l) => l.contentRef.startsWith('tech:') || l.contentRef.startsWith('para:'))) return 'exam';
  const first = lessons[0]?.contentRef;
  if (first === `${TACTIC_PREFIX}preview`) return 'work';
  if (first === `${TACTIC_PREFIX}pointer`) return 'books';
  return 'self';
}

/** Kurs, seçili gruba uymuyor mu? */
export const isTrackMismatch = (lessons: { contentRef: string }[], segment: 'exam' | 'work' | 'books' | 'self') => courseSegment(lessons) !== segment;
