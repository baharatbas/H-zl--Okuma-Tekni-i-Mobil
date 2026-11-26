import type { ExerciseKey } from '../exercises/types';

export type ExamTarget = 'lgs' | 'tyt' | 'kpss' | 'uni';

export type QuestionType = 'main' | 'topic' | 'detail' | 'inference' | 'completion' | 'flow' | 'structure' | 'order';

export const QUESTION_TYPES: QuestionType[] = ['main', 'topic', 'detail', 'inference', 'completion', 'flow', 'structure', 'order'];

/**
 * Sınav ayarları. `targetSec` uygulamanın ÇALIŞMA hedefidir, resmî bir sınav süresi değildir.
 */
export const EXAMS: Record<ExamTarget, { label: string; short: string; optionCount: 4 | 5; targetSec: number }> = {
  lgs: { label: 'LGS', short: '8. sınıf', optionCount: 4, targetSec: 90 },
  tyt: { label: 'TYT / YKS', short: 'Üniversite sınavı', optionCount: 5, targetSec: 70 },
  kpss: { label: 'KPSS / ALES', short: 'Kamu ve lisansüstü', optionCount: 5, targetSec: 65 },
  uni: { label: 'Üniversite', short: 'Akademik metinler', optionCount: 5, targetSec: 75 },
};

export interface ParagraphQuestion {
  id: string;
  type: QuestionType;
  passage: string;
  stem: string;
  /** Her zaman 5 şık; 4 şıklı sınavda bir yanlış şık çıkarılır. */
  options: string[];
  correct: number;
  explanation: string;
  /** true ise şıklar karıştırılmaz (ör. I, II, III). */
  fixedOrder?: boolean;
}

/** Her soru tipinin kurstaki göz/okuma egzersizi. */
export const TYPE_EXERCISE: Record<QuestionType, ExerciseKey> = {
  main: 'skim_read',
  topic: 'word_blocks',
  detail: 'scan_search',
  inference: 'rsvp_repeat',
  completion: 'synonym_match',
  flow: 'line_scan',
  structure: 'schulte',
  order: 'tracking',
};
