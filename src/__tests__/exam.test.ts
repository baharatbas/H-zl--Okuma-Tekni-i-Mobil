import { PARAGRAPH_QUESTIONS, questionsOfType } from '../content/exam/questions';
import { TECHNIQUES } from '../content/exam/techniques';
import { buildExamCourse, examRef } from '../core/exam/course';
import { advice, pickSet, prepareQuestion, stats, weakestType, Attempt } from '../core/exam/practice';
import { QUESTION_TYPES } from '../core/exam/types';
import { EXERCISE_KEYS } from '../core/exercises/registry';
import { createRng } from '../core/rng';

const attempt = (questionId: string, type: Attempt['type'], correct: boolean, ms = 60000): Attempt => ({ questionId, type, correct, durationMs: ms });

describe('paragraf içeriği', () => {
  it('her tipte en az 3 soru ve bir teknik var; kimlikler benzersiz', () => {
    QUESTION_TYPES.forEach((type) => {
      expect(questionsOfType(type).length).toBeGreaterThanOrEqual(3);
      expect(TECHNIQUES[type].steps).toHaveLength(3);
    });
    expect(new Set(PARAGRAPH_QUESTIONS.map((q) => q.id)).size).toBe(PARAGRAPH_QUESTIONS.length);
  });
  it('her sorunun 5 farklı şıkkı, geçerli cevabı ve açıklaması var', () => {
    PARAGRAPH_QUESTIONS.forEach((q) => {
      expect(new Set(q.options).size).toBe(5);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThan(5);
      expect(q.explanation.length).toBeGreaterThan(20);
    });
  });
});

describe('soru hazırlama', () => {
  it('4 ve 5 şıklı hazırlamada doğru cevap korunur', () => {
    const rng = createRng(1);
    PARAGRAPH_QUESTIONS.forEach((q) => {
      [4, 5].forEach((n) => {
        const p = prepareQuestion(q, n, rng);
        expect(p.options).toHaveLength(n);
        expect(p.options[p.correct]).toBe(q.options[q.correct]);
      });
    });
  });
  it('sabit sıralı sorularda şıklar karışmaz', () => {
    const q = questionsOfType('flow')[0];
    const p = prepareQuestion(q, 4, createRng(2));
    expect(p.options).toEqual(q.options.filter((o) => p.options.includes(o)));
  });
});

describe('set seçimi ve puanlama', () => {
  it('çözülmemiş sorular önce, doğru çözülenler en son gelir', () => {
    const pool = questionsOfType('main');
    const history = [attempt(pool[0].id, 'main', true), attempt(pool[1].id, 'main', false)];
    expect(pickSet(pool, history, 3, createRng(3)).map((q) => q.id)).toEqual([pool[2].id, pool[1].id, pool[0].id]);
  });
  it('doğruluk, süre ve öneri', () => {
    const s = stats([attempt('a', 'main', true, 50000), attempt('b', 'main', false, 90000)]);
    expect(s).toEqual({ total: 2, correct: 1, accuracy: 0.5, avgSec: 70 });
    expect(advice(s, 70)).toBe('accuracy');
    expect(advice(stats([attempt('a', 'main', true, 90000)]), 70)).toBe('speed');
    expect(advice(stats([attempt('a', 'main', true, 40000)]), 70)).toBe('great');
  });
  it('zayıf tip en az iki denemeyle belirlenir', () => {
    expect(weakestType([attempt('a', 'flow', false)])).toBeNull();
    expect(weakestType([attempt('a', 'flow', false), attempt('b', 'flow', true), attempt('c', 'main', true), attempt('d', 'main', true)])).toBe('flow');
  });
});

describe('sınav kursu', () => {
  it('her tip için egzersiz, teknik ve soru çalışması adımı üretir', () => {
    const steps = buildExamCourse('intermediate');
    expect(steps).toHaveLength(QUESTION_TYPES.length * 3);
    steps.forEach((s, i) => expect(s.orderIndex).toBe(i));
    expect(EXERCISE_KEYS).toContain(steps[0].contentRef);
    expect(examRef(steps[1].contentRef)).toEqual({ kind: 'tech', type: 'main' });
    expect(examRef(steps[2].contentRef)).toEqual({ kind: 'para', type: 'main' });
    expect(examRef('builtin-sea')).toBeNull();
  });
});
