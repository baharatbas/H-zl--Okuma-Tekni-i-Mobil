import { createRng } from '../core/rng';
import { generateSynonymRound, summarizeSynonyms, SYNONYM_PAIRS } from '../core/exercises/synonyms';
import { generateLineScanRound, lineScanParams, summarizeLineScan, allSentences } from '../core/exercises/lineScan';
import { generateRsvpStream, rsvpParams, scoreRsvp, rsvpWindows } from '../core/exercises/rsvpRepeat';

describe('Eş Anlam Yakalama', () => {
  it('dört farklı şık var ve doğru şık eş anlamlıdır', () => {
    const rng = createRng(1);
    for (let i = 0; i < 100; i++) {
      const r = generateSynonymRound(5, i, rng);
      expect(new Set(r.options).size).toBe(4);
      const pair = SYNONYM_PAIRS.find((p) => p.word === r.word)!;
      expect(r.options[r.correctIndex]).toBe(pair.synonym);
    }
  });
  it('özet doğru ve ortalama tepki süresi hesaplanır', () => {
    const rng = createRng(2);
    const rounds = [0, 1].map((i) => generateSynonymRound(5, i, rng));
    const s = summarizeSynonyms(rounds, [rounds[0].correctIndex, 99], [1000, null]);
    expect(s.correct).toBe(1);
    expect(s.score).toBe(50);
    expect(s.avgResponseMs).toBe(1000);
  });
});

describe('Satır Tarama', () => {
  it('hedef kelime yalnızca hedef satırda geçer', () => {
    const rng = createRng(3);
    const params = lineScanParams(3);
    const pool = allSentences();
    expect(pool.length).toBeGreaterThan(params.lines);
    for (let i = 0; i < 40; i++) {
      const r = generateLineScanRound(params, i, rng, pool);
      expect(r.lines).toHaveLength(params.lines);
      r.lines.forEach((line, li) => {
        const has = line.toLowerCase().includes(r.targetWord);
        if (li === r.targetLine) expect(has).toBe(true);
        else expect(has).toBe(false);
      });
    }
  });
  it('özet doğru satırları sayar', () => {
    const rng = createRng(4);
    const rounds = [0, 1].map((i) => generateLineScanRound(lineScanParams(1), i, rng));
    const s = summarizeLineScan(rounds, [rounds[0].targetLine, null], [500, null]);
    expect(s.correct).toBe(1);
    expect(s.score).toBe(50);
  });
});

describe('Kelime Akışı (tekrar bulma)', () => {
  it('tekrar edilen kelime bir önceki kelimeyle aynıdır', () => {
    const rng = createRng(5);
    const s = generateRsvpStream(rsvpParams(3), rng);
    expect(s.words).toHaveLength(rsvpParams(3).count);
    s.repeats.forEach((i) => expect(s.words[i]).toBe(s.words[i - 1]));
  });
  it('doğru dokunuşlar isabet, fazlası yanlış alarm olarak sayılır', () => {
    const stream = { words: ['a', 'a', 'b', 'b'], repeats: [1, 3], wordMs: 300 };
    expect(rsvpWindows(stream)).toEqual([
      { startMs: 300, endMs: 600 },
      { startMs: 900, endMs: 1200 },
    ]);
    const res = scoreRsvp(stream, [400, 100]);
    expect(res.hits).toBe(1);
    expect(res.falseAlarms).toBe(1);
  });
});
