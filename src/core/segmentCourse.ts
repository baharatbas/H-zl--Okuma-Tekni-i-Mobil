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
    // 7–20: iş belgeleri. Sona eklenir; süren kurslar ilerleme kaybetmeden uzar.
    ['work-purpose', 'scan_answer', 'builtin-work-purpose'],
    ['work-summary', 'skim_read', 'builtin-work-summary'],
    ['work-minutes', 'sentence_order', 'builtin-work-minutes'],
    ['work-policy', 'true_false', 'builtin-work-policy'],
    ['work-proposal', 'main_idea', 'builtin-work-proposal'],
    ['work-numbers', 'flash_numbers', 'builtin-work-numbers'],
    ['work-actions', 'line_scan', 'builtin-work-actions'],
    ['work-contract', 'connector', 'builtin-work-contract'],
    ['work-incident', 'sentence_finish', 'builtin-work-incident'],
    ['work-survey', 'category_odd', 'builtin-work-survey'],
    ['work-manual', 'corsi', 'builtin-work-manual'],
    ['work-compare', 'antonym', 'builtin-work-compare'],
    ['work-project', 'scan_search', 'builtin-work-project'],
    ['work-triage', 'word_hunt', 'builtin-work-announcement'],
  ],
  books: [
    ['pointer', 'pacer_read', 'builtin-storytelling'],
    ['chunking', 'phrase_group', 'builtin-library-history'],
    ['regression', 'rsvp_repeat', 'builtin-letters'],
    ['inner-voice', 'maze_read', 'builtin-proverbs'],
    ['recall', 'sentence_order', 'builtin-theatre'],
    ['preview', 'missing_word', 'builtin-slow-reading'],
    // 7–20: hikâye ve kitap okuma. Sona eklenir; süren kurslar ilerleme kaybetmeden uzar.
    ['book-choose', 'word_find', 'builtin-story-lantern'],
    ['book-schedule', 'pacer_read', 'builtin-story-letter'],
    ['book-characters', 'main_idea', 'builtin-story-garden'],
    ['book-predict', 'sentence_finish', 'builtin-story-train'],
    ['book-visualize', 'corsi', 'builtin-story-map'],
    ['book-emotions', 'antonym', 'builtin-story-baker'],
    ['book-time', 'sentence_order', 'builtin-story-radio'],
    ['book-nonfiction', 'skim_read', 'builtin-story-swim'],
    ['book-narrator', 'stroop', 'builtin-story-violin'],
    ['book-details', 'odd_one', 'builtin-story-seedbank'],
    ['book-revise', 'real_or_fake', 'builtin-story-bridge'],
    ['book-annotate', 'typo_find', 'builtin-story-notebook'],
    ['book-theme', 'category_odd', 'builtin-story-clock'],
    ['book-recall', 'word_memory', 'builtin-story-kite'],
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
