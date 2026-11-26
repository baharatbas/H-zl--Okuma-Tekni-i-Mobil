import { buildCourse, isStepUnlocked, nextUnlockedStep } from '../core/course';
import { LEVELS } from '../core/levels';
import { BUILTIN_TEXTS } from '../content/builtinTexts';
import { findTactic, TACTICS } from '../content/tactics';
import { EXERCISE_KEYS } from '../core/exercises/registry';

describe('kurs üretimi', () => {
  it.each(LEVELS)('%s seviyesi için adımlar sıralı ve geçerli içerik referanslı', (level) => {
    const steps = buildCourse(level);
    expect(steps.length).toBeGreaterThan(0);
    steps.forEach((s, i) => {
      expect(s.orderIndex).toBe(i);
      if (s.type === 'exercise') expect(EXERCISE_KEYS).toContain(s.contentRef);
      else if (findTactic(s.contentRef)) expect(s.type).toBe('reading');
      else expect(BUILTIN_TEXTS.map((t) => t.key)).toContain(s.contentRef);
    });
  });

  it('her ünite egzersiz → okuma → test sırasıyla biter', () => {
    const steps = buildCourse('beginner');
    const unit1 = steps.filter((s) => s.unit === 1);
    expect(unit1[unit1.length - 2].type).toBe('reading');
    expect(unit1[unit1.length - 1].type).toBe('test');
    expect(unit1[0].type).toBe('exercise');
  });

  it('her taktik ünitesi taktik → egzersiz → okuma → test sırasındadır', () => {
    const steps = buildCourse('beginner');
    for (const tactic of TACTICS.slice(0, 21)) {
      const first = steps.find((s) => s.contentRef === `tactic:${tactic.key}`)!;
      const unit = steps.filter((s) => s.unit === first.unit);
      expect(unit.map((s) => s.type)).toEqual(['reading', 'exercise', 'reading', 'test']);
    }
  });

  it.each(LEVELS)('%s kursu 25 üniteden oluşur ve metin tekrar etmez', (level) => {
    const steps = buildCourse(level);
    expect(new Set(steps.map((s) => s.unit)).size).toBe(25);
    const tacticTexts = steps.filter((s) => s.type === 'test').slice(-13).map((s) => s.contentRef);
    expect(new Set(tacticTexts).size).toBe(13);
    expect(steps.every((s) => s.contentRef !== undefined)).toBe(true);
  });

  it('zorluk seviyeye göre artar', () => {
    expect(buildCourse('advanced')[0].difficulty).toBeGreaterThan(buildCourse('beginner')[0].difficulty);
  });
});

describe('kilit açma', () => {
  const steps = [
    { orderIndex: 0, isCompleted: true },
    { orderIndex: 1, isCompleted: false },
    { orderIndex: 2, isCompleted: false },
  ];
  it('ilk adım her zaman açık', () => {
    expect(isStepUnlocked(steps, 0)).toBe(true);
  });
  it('önceki tamamlanmadan sonraki adım kilitli', () => {
    expect(isStepUnlocked(steps, 2)).toBe(false);
    expect(isStepUnlocked(steps, 1)).toBe(true);
  });
  it('sıradaki tamamlanmamış adımı bulur', () => {
    expect(nextUnlockedStep(steps)).toBe(1);
    expect(nextUnlockedStep(steps.map((s) => ({ ...s, isCompleted: true })))).toBeNull();
  });
});
