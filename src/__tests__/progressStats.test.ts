import { average, change, niceScale } from '../core/progressStats';

describe('ilerleme hesapları', () => {
  it('ölçek veriyi kapsar ve orta çizgi tam ortadadır', () => {
    for (const values of [[329], [180, 410], [250, 255, 260], [20]]) {
      const s = niceScale(values);
      expect(s.min).toBeGreaterThanOrEqual(0);
      expect(s.min).toBeLessThanOrEqual(Math.min(...values));
      expect(s.max).toBeGreaterThanOrEqual(Math.max(...values));
      expect(s.ticks[1] % 50).toBe(0);
      expect(s.ticks[1] - s.ticks[0]).toBe(s.ticks[2] - s.ticks[1]);
    }
  });
  it('veri yoksa varsayılan ölçek döner', () => {
    expect(niceScale([])).toEqual({ min: 0, max: 100, ticks: [0, 50, 100] });
  });
  it('değişim için en az iki ölçüm gerekir', () => {
    expect(change([300])).toBeNull();
    expect(change([200, 250, 290])).toBe(90);
    expect(change([300, 270])).toBe(-30);
  });
  it('ortalama yuvarlanır', () => {
    expect(average([])).toBeNull();
    expect(average([100, 101])).toBe(101);
  });
});
