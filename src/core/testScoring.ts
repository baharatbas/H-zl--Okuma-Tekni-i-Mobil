/**
 * Okuma testi değerlendirmesi: okuma hızı + anlama oranı.
 */
import { comprehensionRate, computeWpm, countWords } from './metrics';

export interface QuestionAnswer {
  correctIndex: number;
  /** Kullanıcının seçtiği şık; cevaplanmadıysa null. */
  selectedIndex: number | null;
}

export interface TestOutcome {
  wordCount: number;
  wpm: number;
  correctCount: number;
  totalCount: number;
  comprehension: number;
}

export function scoreTest(text: string, durationMs: number, answers: QuestionAnswer[]): TestOutcome {
  const wordCount = countWords(text);
  const correctCount = answers.filter((a) => a.selectedIndex !== null && a.selectedIndex === a.correctIndex).length;
  return {
    wordCount,
    wpm: computeWpm(wordCount, durationMs),
    correctCount,
    totalCount: answers.length,
    comprehension: comprehensionRate(correctCount, answers.length),
  };
}
