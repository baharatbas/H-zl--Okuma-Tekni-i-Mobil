import { scoreTest } from '../core/testScoring';

describe('okuma testi değerlendirmesi', () => {
  const text = 'bu metin tam olarak altı kelimeden oluşuyor';
  it('WPM ve anlama oranını birlikte hesaplar', () => {
    const outcome = scoreTest(text, 30_000, [
      { correctIndex: 0, selectedIndex: 0 },
      { correctIndex: 2, selectedIndex: 1 },
      { correctIndex: 1, selectedIndex: null },
      { correctIndex: 3, selectedIndex: 3 },
    ]);
    expect(outcome.wordCount).toBe(7);
    expect(outcome.wpm).toBeCloseTo(14);
    expect(outcome.correctCount).toBe(2);
    expect(outcome.totalCount).toBe(4);
    expect(outcome.comprehension).toBe(0.5);
  });
  it('soru yoksa anlama oranı 0 olur', () => {
    expect(scoreTest(text, 60_000, []).comprehension).toBe(0);
  });
});
