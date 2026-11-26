import { EMPTY_STREAK, effectiveStreak, goalProgress, registerActivity, shiftDate } from '../core/streak';

describe('seri (streak)', () => {
  it('ilk aktivite seriyi 1 yapar', () => {
    const s = registerActivity(EMPTY_STREAK, '2026-03-10');
    expect(s).toEqual({ currentStreak: 1, bestStreak: 1, lastActiveDate: '2026-03-10' });
  });
  it('aynı gün tekrar aktivite seriyi artırmaz', () => {
    const s1 = registerActivity(EMPTY_STREAK, '2026-03-10');
    expect(registerActivity(s1, '2026-03-10')).toEqual(s1);
  });
  it('ardışık gün seriyi artırır ve en iyi seriyi günceller', () => {
    let s = registerActivity(EMPTY_STREAK, '2026-03-10');
    s = registerActivity(s, '2026-03-11');
    s = registerActivity(s, '2026-03-12');
    expect(s.currentStreak).toBe(3);
    expect(s.bestStreak).toBe(3);
  });
  it('bir gün atlanırsa seri 1\'e döner ama en iyi seri korunur', () => {
    let s = registerActivity(EMPTY_STREAK, '2026-03-10');
    s = registerActivity(s, '2026-03-11');
    s = registerActivity(s, '2026-03-14');
    expect(s.currentStreak).toBe(1);
    expect(s.bestStreak).toBe(2);
  });
  it('ay ve yıl sınırını doğru geçer', () => {
    expect(shiftDate('2026-03-01', -1)).toBe('2026-02-28');
    expect(shiftDate('2027-01-01', -1)).toBe('2026-12-31');
  });
  it('efektif seri: dün veya bugün aktifse korunur, değilse 0', () => {
    const s = { currentStreak: 4, bestStreak: 4, lastActiveDate: '2026-03-10' };
    expect(effectiveStreak(s, '2026-03-10')).toBe(4);
    expect(effectiveStreak(s, '2026-03-11')).toBe(4);
    expect(effectiveStreak(s, '2026-03-12')).toBe(0);
  });
  it('günlük hedef ilerlemesi 0..1 aralığında', () => {
    expect(goalProgress(5, 10)).toBe(0.5);
    expect(goalProgress(15, 10)).toBe(1);
    expect(goalProgress(5, 0)).toBe(0);
  });
});
