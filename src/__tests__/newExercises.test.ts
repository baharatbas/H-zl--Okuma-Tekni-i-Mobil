import { createRng } from '../core/rng';
import { wordBlockParams, generateWordBlockRound, checkWordBlockAnswer, summarizeWordBlocks, WORD_POOL } from '../core/exercises/wordBlocks';
import { scanParams, generateScanRound, scoreScanRound, summarizeScan, GRID_COLS, GRID_ROWS } from '../core/exercises/scanSearch';
import { pickSkimText, summarizeSkim } from '../core/exercises/skim';
import { BUILTIN_TEXTS } from '../content/builtinTexts';

describe('Kelime Blokları', () => {
  it('dört şık vardır, doğru şık ifadeyle aynı ve şıklar birbirinden farklıdır', () => {
    const rng = createRng(1);
    const params = wordBlockParams(3);
    for (let i = 0; i < 100; i++) {
      const r = generateWordBlockRound(params, i, rng);
      expect(r.options).toHaveLength(4);
      expect(r.options[r.correctIndex]).toBe(r.phrase);
      expect(new Set(r.options).size).toBe(4);
      expect(r.phrase.split(' ')).toHaveLength(params.blockSize);
    }
  });
  it('zorluk arttıkça blok büyür', () => {
    expect(wordBlockParams(5).blockSize).toBeGreaterThan(wordBlockParams(1).blockSize);
  });
  it('cevap ve özet doğru hesaplanır', () => {
    const rng = createRng(2);
    const rounds = [0, 1].map((i) => generateWordBlockRound(wordBlockParams(1), i, rng));
    expect(checkWordBlockAnswer(rounds[0], rounds[0].correctIndex)).toBe(true);
    const s = summarizeWordBlocks(rounds, [rounds[0].correctIndex, null]);
    expect(s.correct).toBe(1);
    expect(s.score).toBe(50);
    expect(WORD_POOL.length).toBeGreaterThan(20);
  });
});

describe('Hızlı Tarama', () => {
  it('hedef hücreler ızgara sınırları içinde ve hedef harf ızgarada o konumlarda', () => {
    const rng = createRng(3);
    const params = scanParams(4);
    for (let i = 0; i < 50; i++) {
      const r = generateScanRound(params, i, rng);
      expect(r.grid).toHaveLength(GRID_COLS * GRID_ROWS);
      expect(r.targetCells).toHaveLength(params.targetsPerRound);
      r.targetCells.forEach((c) => expect(r.grid[c]).toBe(r.target));
      expect(r.grid.filter((l) => l === r.target)).toHaveLength(params.targetsPerRound);
    }
  });
  it('isabet ve yanlış işaret doğru sayılır', () => {
    const res = scoreScanRound([1, 5, 9], [1, 2]);
    expect(res).toEqual({ hits: 1, falseMarks: 1, misses: 2, targets: 3 });
  });
  it('puan yanlış işaretleri yarım cezayla düşürür ve 0-100 aralığında kalır', () => {
    const s = summarizeScan([{ hits: 4, falseMarks: 0, misses: 0, targets: 4 }]);
    expect(s.score).toBe(100);
    const bad = summarizeScan([{ hits: 0, falseMarks: 20, misses: 4, targets: 4 }]);
    expect(bad.score).toBe(0);
  });
});

describe('Hızlı Göz Gezdirme', () => {
  it('seçilen metin havuzdan gelir', () => {
    const t = pickSkimText(3, createRng(4));
    expect(BUILTIN_TEXTS.map((x) => x.key)).toContain(t.key);
  });
  it('zorluk arttıkça daha uzun metin seçilir (ortalama)', () => {
    const avg = (d: number) => {
      const rng = createRng(9);
      let sum = 0;
      for (let i = 0; i < 60; i++) sum += pickSkimText(d, rng).body.length;
      return sum / 60;
    };
    expect(avg(5)).toBeGreaterThan(avg(1));
  });
  it('özet doğruluğu yüzde olarak verir', () => {
    expect(summarizeSkim(2, 3).score).toBe(67);
  });
});
