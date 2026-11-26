import { BUILTIN_TEXTS } from '../content/builtinTexts';

describe('hazır metin kütüphanesi', () => {
  it('20 hazır metin var ve anahtarları benzersiz', () => {
    expect(BUILTIN_TEXTS).toHaveLength(20);
    expect(new Set(BUILTIN_TEXTS.map((t) => t.key)).size).toBe(20);
  });
  it('her metnin üç soruluk, geçerli doğru cevaplı testi var', () => {
    for (const text of BUILTIN_TEXTS) {
      expect(text.questions).toHaveLength(3);
      for (const q of text.questions) {
        expect(q.options).toHaveLength(4);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(4);
      }
    }
  });
});
