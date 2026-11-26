import { BUILTIN_TEXTS } from '../content/builtinTexts';

describe('hazır metin kütüphanesi', () => {
  it('70 hazır metin var ve anahtarları benzersiz', () => {
    expect(BUILTIN_TEXTS).toHaveLength(70);
    expect(new Set(BUILTIN_TEXTS.map((t) => t.key)).size).toBe(70);
    expect(new Set(BUILTIN_TEXTS.map((t) => t.title)).size).toBe(70);
  });
  it('her metnin üç soruluk, geçerli doğru cevaplı testi var', () => {
    for (const text of BUILTIN_TEXTS) {
      expect(text.questions).toHaveLength(3);
      for (const q of text.questions) expect(new Set(q.options).size).toBe(4);
      for (const q of text.questions) {
        expect(q.options).toHaveLength(4);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(4);
      }
    }
  });
});
