import { combineMeasurements, equivalentPool, measurementFlags, pickBaseline, speedCostsComprehension, textProfile } from '../core/assessment';
import { computeWpm, countWords } from '../core/metrics';
import { createRng } from '../core/rng';
import { BUILTIN_TEXTS } from '../content/builtinTexts';
import { scoreTest } from '../core/testScoring';
import { openMemoryDb } from './helpers/nodeSqlite';
import { migrate } from '../db/migrate';
import { seedBuiltins } from '../db/seed';
import { createTextRepository } from '../repositories/textRepository';
import { createProgressRepository } from '../repositories/progressRepository';

describe('ölçüm kuralları', () => {
  it('spec örneği: 300 kelime 90 saniyede 200 kelime/dk', () => {
    expect(computeWpm(300, 90_000)).toBeCloseTo(200);
  });
  it('tek başına noktalama kelime sayılmaz', () => {
    expect(countWords("Ankara'dan — 250 kişi … geldi.")).toBe(4);
  });
  it('başlangıç testi üç farklı, görülmemiş ve yakın uzunlukta metin seçer', () => {
    const seen = equivalentPool(BUILTIN_TEXTS).slice(0, 5).map((t) => t.key);
    const picked = pickBaseline(BUILTIN_TEXTS, seen, createRng(1));
    expect(new Set(picked.map((t) => t.key)).size).toBe(3);
    expect(picked.some((t) => seen.includes(t.key))).toBe(false);
    const words = equivalentPool(BUILTIN_TEXTS).map((t) => textProfile(t.body).words);
    expect(Math.max(...words) / Math.min(...words)).toBeLessThan(1.5);
  });
  it('şüpheli ölçümleri işaretler', () => {
    expect(measurementFlags({ wpm: 220, comprehension: 1, seenBefore: false })).toEqual([]);
    expect(measurementFlags({ wpm: 900, comprehension: 0.2, seenBefore: true })).toEqual(['too_fast', 'low_comp', 'seen']);
    expect(measurementFlags({ wpm: 350, comprehension: 0, seenBefore: false })).toEqual(['skipped']);
    expect(measurementFlags({ wpm: 350, comprehension: 0.2, seenBefore: false })).toEqual(['low_comp']);
    expect(measurementFlags({ wpm: 250, comprehension: 0, seenBefore: false })).toEqual([]);
    expect(measurementFlags({ wpm: 220, comprehension: 1, seenBefore: false, interrupted: true })).toEqual(['interrupted']);
    expect(measurementFlags({ wpm: 20, comprehension: 1, seenBefore: false })).toEqual(['too_slow']);
  });
  it('birden çok metin toplam kelime ve süreyle birleştirilir', () => {
    const r = combineMeasurements([
      { wordCount: 100, durationMs: 30_000, correctCount: 3, totalCount: 3 },
      { wordCount: 100, durationMs: 60_000, correctCount: 1, totalCount: 3 },
    ]);
    expect(Math.round(r.wpm)).toBe(133);
    expect(r.comprehension).toBeCloseTo(4 / 6);
  });
  it('hız artarken anlama düşerse uyarır', () => {
    expect(speedCostsComprehension({ wpm: 200, comprehension: 1 }, { wpm: 260, comprehension: 0.67 })).toBe(true);
    expect(speedCostsComprehension({ wpm: 200, comprehension: 0.8 }, { wpm: 260, comprehension: 0.8 })).toBe(false);
  });
  it('aynı metnin ikinci ölçümü grafiğe alınmaz', () => {
    const db = openMemoryDb();
    migrate(db);
    seedBuiltins(db);
    const texts = createTextRepository(db);
    const test = texts.getTest(texts.getByKey('builtin-sea')!.id)!;
    const outcome = scoreTest('bir '.repeat(100), 30_000, [{ correctIndex: 0, selectedIndex: 0 }]);
    expect(texts.recordTestResult(test.id, outcome, 30_000)).toEqual([]);
    expect(texts.recordTestResult(test.id, outcome, 30_000)).toEqual(['seen']);
    expect(createProgressRepository(db).getPerformanceSeries()).toHaveLength(1);
    expect(texts.seenKeys()).toEqual(['builtin-sea']);
  });
});
