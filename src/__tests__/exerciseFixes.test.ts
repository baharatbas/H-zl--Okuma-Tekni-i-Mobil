import { cleanWord, generateLineScanRound, lineScanParams } from '../core/exercises/lineScan';
import { generateRsvpStream, rsvpParams, scoreRsvp } from '../core/exercises/rsvpRepeat';
import { generateSynonymSet } from '../core/exercises/synonyms';
import { generateWordBlockRound, wordBlockParams } from '../core/exercises/wordBlocks';
import { createRng } from '../core/rng';

describe('egzersiz düzeltmeleri', () => {
  it('satır tarama Türkçe harfleri bozmaz', () => {
    expect(cleanWord('Hikâye,')).toBe('hikâye');
    expect(cleanWord('Işık.')).toBe('ışık');
    expect(cleanWord('İyi')).toBe('iyi');
  });
  it('satır tarama hedefi yalnızca tek satırda bulunur', () => {
    for (let seed = 0; seed < 200; seed++) {
      const r = generateLineScanRound(lineScanParams(5), 0, createRng(seed));
      const hits = r.lines.filter((l) => l.split(' ').map(cleanWord).some((w) => w.includes(r.targetWord)));
      expect(hits).toHaveLength(1);
    }
  });
  it('kelime akışında tekrarlar bitişik olmaz ve gecikmeli dokunuş sayılır', () => {
    for (let seed = 0; seed < 100; seed++) {
      const s = generateRsvpStream(rsvpParams(5), createRng(seed), 0.5);
      s.repeats.forEach((i, k) => k > 0 && expect(i - s.repeats[k - 1]).toBeGreaterThan(2));
    }
    const stream = { words: ['a', 'b', 'b', 'c'], repeats: [2], wordMs: 350 };
    expect(scoreRsvp(stream, [1300]).hits).toBe(1); // kelime 700 ms'de belirdi, 600 ms sonra dokunuldu
  });
  it('eş anlam setinde kelime tekrarlanmaz ve doğru şık yerinde', () => {
    const set = generateSynonymSet(10, createRng(3));
    expect(new Set(set.map((r) => r.word)).size).toBe(10);
    set.forEach((r) => expect(new Set(r.options).size).toBe(4));
  });
  it('kelime bloklarında dört farklı şık vardır', () => {
    for (let seed = 0; seed < 100; seed++) {
      const r = generateWordBlockRound(wordBlockParams(1), 0, createRng(seed));
      expect(new Set(r.options).size).toBe(4);
    }
  });
});
