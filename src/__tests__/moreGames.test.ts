import * as g from '../core/exercises/moreGames';
import { generateZigzagSteps, zigzagParams } from '../core/exercises/zigzag';
import { createRng } from '../core/rng';

const levels = [1, 2, 3, 4, 5];

describe('ek egzersizler', () => {
  it.each(levels)('seviye %i: seçmeli turlar tutarlı', (d) => {
    for (let seed = 0; seed < 40; seed++) {
      for (const make of [g.stroopRounds, g.antonymRounds, g.categoryOddRounds, g.connectorRounds, g.mainIdeaRounds, g.scanAnswerRounds]) {
        const rounds = make(d, createRng(seed));
        expect(rounds.length).toBeGreaterThanOrEqual(4);
        for (const r of rounds) {
          expect(new Set(r.options).size).toBe(r.options.length);
          expect(r.correctIndex).toBeGreaterThanOrEqual(0);
          expect(r.correctIndex).toBeLessThan(r.options.length);
        }
      }
    }
  });
  it.each(levels)('seviye %i: sıralama, farklıyı bul, kare ve sütun turları', (d) => {
    for (const r of g.sentenceOrderRounds(d, createRng(d))) {
      expect([...r.shuffled].sort()).toEqual([...r.correct].sort());
      expect(r.shuffled).not.toEqual(r.correct);
      expect(g.orderScore(r, r.correct)).toBe(r.correct.length);
    }
    for (const r of g.oddOneRounds(d, createRng(d))) {
      expect(r.cells.filter((c) => c === r.cells[r.oddIndex])).toHaveLength(1);
    }
    for (const s of g.corsiRounds(d, createRng(d))) expect(new Set(s).size).toBe(2 + d);
    const flow = g.columnFlow(d, createRng(d));
    expect(flow.some((i) => i.target)).toBe(true);
    expect(flow[0].column).not.toBe(flow[1].column);
    const pacer = g.pacerText(d, createRng(d));
    expect(pacer.questions.length).toBeGreaterThan(0);
    expect(pacer.lines.every((l) => l.ms > 0)).toBe(true);
  });
  it('çapraz zigzag dört köşeyi gezer', () => {
    const steps = generateZigzagSteps(zigzagParams('diagonal', 1));
    expect(new Set(steps.slice(0, 4).map((s) => `${s.position.x}-${s.position.y}`)).size).toBe(4);
  });
});
