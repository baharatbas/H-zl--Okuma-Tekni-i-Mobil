import { blockChunks, chunkText, msPerWord, totalDuration } from '../core/reader';

describe('Hızlı Oku zamanlaması', () => {
  it('300 WPM için kelime başına 200 ms', () => {
    expect(msPerWord(300)).toBe(200);
  });
  it('kelime modu: her parça tek kelimedir', () => {
    const chunks = chunkText('bir iki üç', 300, 1);
    expect(chunks.map((c) => c.text)).toEqual(['bir', 'iki', 'üç']);
    expect(chunks.every((c) => c.durationMs === 200)).toBe(true);
  });
  it('parça modu: son parça kalan kelimeleri içerir ve süresi buna göre hesaplanır', () => {
    const chunks = chunkText('a b c d e', 300, 2);
    expect(chunks.map((c) => c.text)).toEqual(['a b', 'c d', 'e']);
    expect(chunks.map((c) => c.durationMs)).toEqual([400, 400, 200]);
    expect(totalDuration(chunks)).toBe(1000);
  });
  it('boş metin boş liste döner', () => {
    expect(chunkText('   ', 300, 2)).toEqual([]);
  });
  it('blok modu cümleleri noktalama ile ayırır', () => {
    const chunks = blockChunks('Merhaba dünya. Bugün hava güzel! Peki ya sen?', 600);
    expect(chunks.map((c) => c.text)).toEqual(['Merhaba dünya.', 'Bugün hava güzel!', 'Peki ya sen?']);
    expect(chunks[0].durationMs).toBe(200); // 2 kelime × 100 ms
  });
});
