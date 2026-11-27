import { PARAGRAPH_QUESTIONS, questionsOfType } from '../content/exam/questions';
import { QUESTION_TYPES } from '../core/exam/types';

describe('paragraf soru bankası içeriği', () => {
  it('kimlikler ve paragraflar benzersiz, şıklar yinelenmiyor', () => {
    expect(new Set(PARAGRAPH_QUESTIONS.map((q) => q.id)).size).toBe(PARAGRAPH_QUESTIONS.length);
    expect(new Set(PARAGRAPH_QUESTIONS.map((q) => q.passage)).size).toBe(PARAGRAPH_QUESTIONS.length);
    for (const q of PARAGRAPH_QUESTIONS) {
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options).toHaveLength(5);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.explanation.length).toBeGreaterThan(5);
    }
  });
  it('64 günlük (günde 5) soru var, her tipten 40', () => {
    expect(PARAGRAPH_QUESTIONS).toHaveLength(64 * 5);
    for (const type of QUESTION_TYPES) expect(questionsOfType(type)).toHaveLength(40);
  });
  it('tipler dengeli', () => {
    const counts = QUESTION_TYPES.map((type) => questionsOfType(type).length);
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(2);
  });
});
