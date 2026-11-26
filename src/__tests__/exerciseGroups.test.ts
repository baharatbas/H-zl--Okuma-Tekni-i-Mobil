import { EXERCISE_GROUPS, SHORT_SKILL } from '../content/exerciseGroups';
import { EXERCISE_KEYS } from '../core/exercises/registry';

describe('egzersiz grupları', () => {
  it('her egzersiz tam olarak bir grupta ve kısa açıklaması var', () => {
    const grouped = EXERCISE_GROUPS.flatMap((g) => g.keys);
    expect([...grouped].sort()).toEqual([...EXERCISE_KEYS].sort());
    EXERCISE_KEYS.forEach((k) => expect(SHORT_SKILL[k]).toBeTruthy());
  });
});
