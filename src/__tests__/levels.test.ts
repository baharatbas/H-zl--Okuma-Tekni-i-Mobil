import { determineLevel, isLevel, LEVEL_PARAMS } from '../core/levels';

describe('determineLevel', () => {
  it('düşük etkin hız başlangıç seviyesi verir', () => {
    expect(determineLevel(120, 0.9)).toBe('beginner');
  });
  it('orta etkin hız orta seviye verir', () => {
    expect(determineLevel(250, 0.9)).toBe('intermediate');
  });
  it('yüksek etkin hız ileri seviye verir', () => {
    expect(determineLevel(400, 0.9)).toBe('advanced');
  });
  it('anlama düşükse hız yüksek olsa bile bir kademe düşer', () => {
    expect(determineLevel(400, 0.5)).toBe('beginner'); // etkin 200 → orta, anlama düşük → başlangıç
    expect(determineLevel(600, 0.6)).toBe('intermediate'); // etkin 360 → ileri, anlama düşük → orta
    expect(determineLevel(250, 0.5)).toBe('beginner');
  });
  it('başlangıç seviyesi daha aşağı inmez', () => {
    expect(determineLevel(50, 0.1)).toBe('beginner');
  });
});

describe('seviye parametreleri', () => {
  it('her seviye için hedef hız ve zorluk tanımlı ve artan', () => {
    expect(LEVEL_PARAMS.beginner.targetWpm).toBeLessThan(LEVEL_PARAMS.intermediate.targetWpm);
    expect(LEVEL_PARAMS.intermediate.targetWpm).toBeLessThan(LEVEL_PARAMS.advanced.targetWpm);
    expect(LEVEL_PARAMS.advanced.exerciseDifficulty).toBe(5);
  });
  it('isLevel geçersiz değerleri reddeder', () => {
    expect(isLevel('beginner')).toBe(true);
    expect(isLevel('expert')).toBe(false);
    expect(isLevel(null)).toBe(false);
  });
});
