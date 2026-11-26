import { buildCourse, unitMeta } from '../core/course';
import { LEVELS } from '../core/levels';
import { EXERCISES, EXERCISE_KEYS } from '../core/exercises/registry';
import { BUILTIN_TEXTS } from '../content/builtinTexts';
import { LESSON_NOTES, lessonNote } from '../content/lessonNotes';

describe('kurs içeriği zenginliği', () => {
  it('her ünitenin başlığı ve hedefi var', () => {
    for (const level of LEVELS) {
      const units = new Set(buildCourse(level).map((s) => s.unit));
      units.forEach((u) => {
        const m = unitMeta(level, u);
        expect(m.title.length).toBeGreaterThan(3);
        expect(m.goal.length).toBeGreaterThan(10);
      });
    }
  });
  it('her egzersizin ipucu ve hedefi var', () => {
    for (const key of EXERCISE_KEYS) {
      expect(EXERCISES[key].tip.length).toBeGreaterThan(20);
      expect(EXERCISES[key].goal.length).toBeGreaterThan(10);
    }
  });
  it('her hazır metnin hedefi ve stratejisi var', () => {
    for (const text of BUILTIN_TEXTS) {
      expect(LESSON_NOTES[text.key]).toBeDefined();
      expect(lessonNote(text.key)!.strategy.length).toBeGreaterThan(20);
    }
  });
});
