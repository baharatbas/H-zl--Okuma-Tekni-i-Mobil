import { greetingKey } from '../core/greeting';

describe('selamlama', () => {
  it('saat sınırlarını doğru ayırır', () => {
    expect(greetingKey(5)).toBe('morning');
    expect(greetingKey(10)).toBe('morning');
    expect(greetingKey(11)).toBe('day');
    expect(greetingKey(17)).toBe('day');
    expect(greetingKey(18)).toBe('evening');
    expect(greetingKey(2)).toBe('evening');
  });
});
