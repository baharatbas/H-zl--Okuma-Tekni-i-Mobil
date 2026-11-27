/**
 * Sınav kursu: her soru tipi bir ünite → göz/okuma egzersizi, teknik dersi, süreli soru çalışması.
 * Mevcut kurs tablosu kullanılır: teknik dersi 'reading' ("tech:<tip>"), soru çalışması 'test' ("para:<tip>").
 */
import type { LessonStep } from '../course';
import { TACTIC_PREFIX, TACTICS } from '../../content/tactics';
import type { Level } from '../levels';
import { QuestionType, QUESTION_TYPES, TYPE_EXERCISE } from './types';

export const TECH_PREFIX = 'tech:';
export const PARA_PREFIX = 'para:';

/** [taktik, okuma metni] */
const EXAM_SPEED_UNITS: [string, string][] = [
  ['exam-stem', 'builtin-scientific-method'],
  ['exam-time', 'builtin-decisions'],
  ['exam-eliminate', 'builtin-attention'],
  ['exam-keywords', 'builtin-vaccine'],
  ['exam-connectors', 'builtin-architecture'],
  ['exam-long', 'builtin-glacier'],
  ['exam-pace', 'builtin-slow-reading'],
];

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
  // Soru tiplerinden sonra sınav hızı üniteleri: taktik → alıştırma → okuma → test.
  // Sona eklenir; böylece süren kurslar ilerleme kaybetmeden uzar.
  EXAM_SPEED_UNITS.forEach(([key, text], i) => {
    const unit = QUESTION_TYPES.length + i + 1;
    const add = (kind: LessonStep['type'], contentRef: string) =>
      steps.push({ orderIndex: steps.length, type: kind, contentRef, unit, difficulty });
    add('reading', `${TACTIC_PREFIX}${key}`);
    add('exercise', TACTICS.find((t) => t.key === key)!.exercise);
    add('reading', text);
    add('test', text);
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
