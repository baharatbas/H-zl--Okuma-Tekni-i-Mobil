import * as games from '../core/exercises/wordGames';
import { createRng } from '../core/rng';
import { FAKE_WORDS, REAL_WORDS } from '../content/wordGames';

const levels = [1, 2, 3, 4, 5];

describe('kelime oyunları', () => {
  it.each(levels)('seviye %i: seçmeli turlarda tek doğru cevap ve yinelenmeyen şıklar', (d) => {
    for (const make of [games.wordFindRounds, games.phraseRounds, games.missingWordRounds, games.sentenceFinishRounds, games.realOrFakeRounds, games.trueFalseRounds]) {
      const rounds = make(d, createRng(d));
      expect(rounds.length).toBeGreaterThanOrEqual(3);
      for (const r of rounds) {
        expect(new Set(r.options).size).toBe(r.options.length);
        expect(r.correctIndex).toBeGreaterThanOrEqual(0);
      }
    }
  });
  it.each(levels)('seviye %i: labirent her metinde yeterli boşluk üretir', (d) => {
    for (let seed = 0; seed < 150; seed++) {
      const rounds = games.mazeRounds(d, createRng(seed));
      expect(rounds.length).toBeGreaterThanOrEqual(5);
      for (const r of rounds) expect(new Set(r.options).size).toBe(r.options.length);
    }
  });
  it.each(levels)('seviye %i: bitişik sözcüklerin sınırları doğru', (d) => {
    for (const r of games.wordChainRounds(d, createRng(d))) {
      const cuts = [0, ...r.starts, r.letters.length];
      expect(r.words).toEqual(cuts.slice(0, -1).map((c, i) => r.letters.slice(c, cuts[i + 1]).join('')));
      expect(games.chainCorrect(r, r.starts)).toBe(true);
      expect(games.chainCorrect(r, [])).toBe(false);
    }
  });
  it('sürükleme sekiz yönde düz çizgi seçer ve ızgaradan taşmaz', () => {
    expect(games.lineCells(6, 0, 3)).toEqual([0, 1, 2, 3]);
    expect(games.lineCells(6, 3, 0)).toEqual([3, 2, 1, 0]);
    expect(games.lineCells(6, 1, 19)).toEqual([1, 7, 13, 19]);
    expect(games.lineCells(6, 0, 21)).toEqual([0, 7, 14, 21]);
    // Hafif sapan sürükleme en yakın yöne oturur.
    expect(games.lineCells(6, 0, 10)).toEqual([0, 1, 2, 3, 4]);
    expect(games.lineCells(6, 14, 14)).toEqual([14]);
    expect(games.lineCells(6, 4, 17).every((c) => c >= 0 && c < 36)).toBe(true);
  });
  it('uydurma sözcükler gerçek listede yok', () => {
    expect(FAKE_WORDS.filter((w) => REAL_WORDS.includes(w))).toEqual([]);
  });
  it.each(levels)('seviye %i: hatalı sözcük gerçekten değişmiştir', (d) => {
    for (let seed = 0; seed < 30; seed++) {
      const rounds = games.typoRounds(d, createRng(seed));
      expect(rounds).toHaveLength(6);
      for (const r of rounds) expect(r.words[r.wrongIndex]).not.toBe(r.original);
    }
  });
  it('kelime hafızasında seviye arttıkça sözcük sayısı artar', () => {
    expect(levels.map((d) => games.wordMemoryRounds(d, createRng(1))[0].words.length)).toEqual([3, 5, 7, 9, 10]);
  });
  it.each(levels)('seviye %i: kelime avında bütün sözcükler ızgaraya yerleşir', (d) => {
    for (let seed = 0; seed < 30; seed++) {
      const p = games.wordHuntPuzzle(d, createRng(seed));
      expect(p.words).toHaveLength([3, 4, 4, 5, 6][d - 1]);
      for (const w of p.words) {
        expect(w.cells.map((c) => p.grid[c]).join('')).toBe(w.word);
        expect(games.huntMatch(p, w.cells[w.cells.length - 1], w.cells[0])).toBe(w.word);
      }
    }
  });
});
