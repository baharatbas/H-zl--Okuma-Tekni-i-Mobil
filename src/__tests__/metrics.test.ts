import { accuracy, comprehensionPercent, comprehensionRate, computeWpm, countWords, effectiveWpm } from '../core/metrics';

describe('countWords', () => {
  it('boşluk ve satır sonlarını ayırıcı kabul eder', () => {
    expect(countWords('bir iki\nüç   dört\t beş')).toBe(5);
  });
  it('boş metinde 0 döner', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   \n  ')).toBe(0);
  });
});

describe('computeWpm', () => {
  it('kelime / dakika hesaplar', () => {
    // 300 kelime 60 saniyede = 300 WPM
    expect(computeWpm(300, 60_000)).toBeCloseTo(300);
    // 150 kelime 30 saniyede = 300 WPM
    expect(computeWpm(150, 30_000)).toBeCloseTo(300);
  });
  it('sıfır veya negatif sürede 0 döner (bölme hatası yok)', () => {
    expect(computeWpm(100, 0)).toBe(0);
    expect(computeWpm(100, -5)).toBe(0);
  });
  it('kelime sayısı sıfırsa 0 döner', () => {
    expect(computeWpm(0, 60_000)).toBe(0);
  });
});

describe('comprehensionRate', () => {
  it('doğru / toplam oranını verir', () => {
    expect(comprehensionRate(2, 3)).toBeCloseTo(2 / 3);
    expect(comprehensionPercent(2, 3)).toBe(67);
  });
  it('soru yoksa 0 döner', () => {
    expect(comprehensionRate(0, 0)).toBe(0);
  });
  it('0..1 aralığına sıkıştırır', () => {
    expect(comprehensionRate(5, 3)).toBe(1);
    expect(comprehensionRate(-1, 3)).toBe(0);
  });
});

describe('effectiveWpm & accuracy', () => {
  it('etkin hız WPM × anlama oranıdır', () => {
    expect(effectiveWpm(300, 0.5)).toBe(150);
  });
  it('doğruluk deneme sayısı 0 ise 0 döner', () => {
    expect(accuracy(3, 0)).toBe(0);
    expect(accuracy(3, 4)).toBeCloseTo(0.75);
  });
});
