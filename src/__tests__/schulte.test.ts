import { generateSchulteGrid, schulteParams, summarizeSchulte } from '../core/exercises/schulte';
import { createRng } from '../core/rng';

describe('Schulte Tablosu', () => {
  it('seviye arttıkça tablo büyür, son seviyede yeniden karışır', () => {
    expect(schulteParams(1).size).toBe(3);
    expect(schulteParams(3).size).toBe(5);
    expect(schulteParams(5)).toMatchObject({ size: 6, reshuffle: true });
    expect(schulteParams(2, 60).durationMs).toBe(60000);
  });
  it('tabloda 1..n² her sayı bir kez bulunur', () => {
    const grid = generateSchulteGrid(5, createRng(1));
    expect([...grid].sort((a, b) => a - b)).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
  });
  it('hedef hızda hatasız oyun 100, hata ve yavaşlık puanı düşürür', () => {
    const p = schulteParams(1);
    expect(summarizeSchulte(p, 60, 0, 60000).score).toBe(100);
    expect(summarizeSchulte(p, 60, 0, 120000).score).toBe(50);
    expect(summarizeSchulte(p, 30, 10, 30000).score).toBe(75);
  });
  it('hiç dokunulmadıysa puan 0', () => {
    expect(summarizeSchulte(schulteParams(1), 0, 0, 120000)).toEqual({ score: 0, accuracy: 0, avgResponseMs: null });
  });
});
