import { BUILTIN_TEXTS } from '../content/builtinTexts';

describe('hazır metin kütüphanesi', () => {
  it('98 hazır metin var ve anahtarları benzersiz', () => {
    expect(BUILTIN_TEXTS).toHaveLength(98);
    expect(new Set(BUILTIN_TEXTS.map((t) => t.key)).size).toBe(98);
    expect(new Set(BUILTIN_TEXTS.map((t) => t.title)).size).toBe(98);
  });
  it('her metnin 3 ya da 5 soruluk, geçerli doğru cevaplı testi var', () => {
    for (const text of BUILTIN_TEXTS) {
      expect([3, 5]).toContain(text.questions.length);
      for (const q of text.questions) expect(new Set(q.options).size).toBe(4);
      for (const q of text.questions) {
        expect(q.options).toHaveLength(4);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(4);
      }
    }
  });
});

describe('ölçüm metinleri', () => {
  it('seviye testi için en az üç metin 5 soruludur ve sorular yinelenmez', () => {
    const measurable = BUILTIN_TEXTS.filter((t) => t.questions.length >= 5);
    expect(measurable.length).toBeGreaterThanOrEqual(3);
    for (const t of measurable) expect(new Set(t.questions.map((q) => q.question)).size).toBe(t.questions.length);
  });
});
