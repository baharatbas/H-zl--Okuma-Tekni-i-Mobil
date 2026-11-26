import { createRng } from '../core/rng';
import {
  checkStarAnswer,
  displayTimeForRound,
  generateStarRound,
  starHunterParams,
  summarizeStarHunter,
} from '../core/exercises/starHunter';
import { checkFlashAnswer, flashParams, generateFlashRound } from '../core/exercises/flashNumbers';
import { generatePeripheralRound, peripheralParams, checkPeripheralAnswer } from '../core/exercises/peripheral';
import { generateTargetWindows, scoreTracking, trackingParams } from '../core/exercises/tracking';
import { generateZigzagSteps, summarizeZigzag, zigzagParams } from '../core/exercises/zigzag';

describe('Yıldız Avcısı', () => {
  it('gösterim süresi hız ayarından başlar ve minimuma kadar düşer', () => {
    const p = starHunterParams(1, 800);
    expect(displayTimeForRound(p, 0)).toBe(800);
    expect(displayTimeForRound(p, 1)).toBeLessThan(800);
    expect(displayTimeForRound(p, 1000)).toBe(p.minMs);
  });

  it('zorluk arttıkça renk ve yıldız sayısı artar', () => {
    const easy = starHunterParams(1);
    const hard = starHunterParams(5);
    expect(hard.colorCount).toBeGreaterThan(easy.colorCount);
    expect(hard.maxStars).toBeGreaterThan(easy.maxStars);
  });

  it('bir turda hedef renkte doğru sayıda yıldız vardır ve konumlar çakışmaz', () => {
    const rng = createRng(42);
    const params = starHunterParams(5);
    for (let i = 0; i < 200; i++) {
      const round = generateStarRound(params, i, rng);
      const targetStars = round.stars.filter((s) => s.color === round.targetColor);
      expect(targetStars.length).toBe(round.targetCount);
      expect(round.targetCount).toBeGreaterThanOrEqual(1);
      expect(round.palette).toContain(round.targetColor);
      const positions = new Set(round.stars.map((s) => `${s.x}:${s.y}`));
      expect(positions.size).toBe(round.stars.length);
    }
  });

  it('cevap değerlendirmesi ve özet doğru hesaplanır', () => {
    const rng = createRng(7);
    const rounds = [0, 1, 2].map((i) => generateStarRound(starHunterParams(1), i, rng));
    const answers = [
      { guess: rounds[0].targetCount, responseMs: 1000 },
      { guess: rounds[1].targetCount + 1, responseMs: 2000 },
      null,
    ];
    expect(checkStarAnswer(rounds[0], answers[0]!)).toBe(true);
    const summary = summarizeStarHunter(rounds, answers);
    expect(summary.correct).toBe(1);
    expect(summary.total).toBe(3);
    expect(summary.accuracy).toBeCloseTo(1 / 3);
    expect(summary.avgResponseMs).toBe(1500);
    expect(summary.score).toBe(33);
  });

  it('aynı tohum aynı turu üretir (tekrar üretilebilirlik)', () => {
    const a = generateStarRound(starHunterParams(3), 0, createRng(99));
    const b = generateStarRound(starHunterParams(3), 0, createRng(99));
    expect(a).toEqual(b);
  });
});

describe('Flaş Sayılar', () => {
  it('basamak sayısı zorlukla artar ve değer doğru uzunluktadır', () => {
    const rng = createRng(3);
    const r = generateFlashRound(flashParams(2, 200), 0, rng);
    expect(r.value.length).toBe(4);
    expect(r.value[0]).not.toBe('0');
    expect(r.flashMs).toBe(200);
  });
  it('cevap boşluklar kırpılarak karşılaştırılır', () => {
    const r = { index: 0, value: '4821', flashMs: 300 };
    expect(checkFlashAnswer(r, ' 4821 ')).toBe(true);
    expect(checkFlashAnswer(r, '4812')).toBe(false);
  });
});

describe('Harfleri Gör', () => {
  it('harfler farklı sektörlere yerleşir ve sayı üst sınırı aşmaz', () => {
    const rng = createRng(11);
    const params = peripheralParams(5);
    for (let i = 0; i < 100; i++) {
      const r = generatePeripheralRound(params, i, rng);
      expect(r.letters.length).toBeLessThanOrEqual(params.maxLetters);
      const angles = new Set(r.letters.map((l) => l.angle));
      expect(angles.size).toBe(r.letters.length);
    }
  });
  it('kaç harf olduğu tahminle karşılaştırılır', () => {
    const r = generatePeripheralRound(peripheralParams(1), 0, createRng(5));
    expect(checkPeripheralAnswer(r, r.letters.length)).toBe(true);
    expect(checkPeripheralAnswer(r, r.letters.length + 1)).toBe(false);
  });
});

describe('Nesneyi Takip Et', () => {
  it('hedef pencereleri süre içinde ve çakışmadan üretilir', () => {
    const params = trackingParams(3, 30, 1000);
    const windows = generateTargetWindows(params, createRng(21));
    windows.forEach((w, i) => {
      expect(w.startMs).toBeGreaterThanOrEqual(0);
      expect(w.endMs).toBeLessThanOrEqual(params.durationMs);
      if (i > 0) expect(w.startMs).toBeGreaterThanOrEqual(windows[i - 1].endMs);
    });
  });

  it('isabet, ıskalama ve yanlış alarm doğru sayılır', () => {
    const windows = [
      { startMs: 1000, endMs: 1800 },
      { startMs: 5000, endMs: 5800 },
      { startMs: 9000, endMs: 9800 },
    ];
    // 1. hedef isabet, 2. hedefte dokunuş yok (ıska), 3000ms'de yanlış dokunuş
    const s = scoreTracking(windows, [1200, 3000]);
    expect(s.hits).toBe(1);
    expect(s.misses).toBe(2);
    expect(s.falseAlarms).toBe(1);
    expect(s.accuracy).toBeCloseTo(1 / 3);
    expect(s.avgResponseMs).toBe(200);
  });

  it('aynı pencereye iki kez dokunmak ikinci kez isabet sayılmaz', () => {
    const s = scoreTracking([{ startMs: 0, endMs: 1000 }], [100, 200]);
    expect(s.hits).toBe(1);
    expect(s.falseAlarms).toBe(1);
  });
});

describe('Zigzag', () => {
  it('adımlar iki kenar arasında dönüşümlü gider', () => {
    const steps = generateZigzagSteps(zigzagParams('horizontal', 1));
    expect(steps.slice(0, 4).map((s) => s.side)).toEqual([0, 1, 0, 1]);
    expect(steps[0].position.x).toBeLessThan(steps[1].position.x);
  });
  it('dikey zigzag y ekseninde kenar kullanır', () => {
    const steps = generateZigzagSteps(zigzagParams('vertical', 1));
    expect(steps[0].position.y).toBeLessThan(steps[1].position.y);
  });
  it('zamanında yapılan dokunuşlar isabet sayılır', () => {
    const s = summarizeZigzag([100, null, 300, 2000], 800);
    expect(s.hits).toBe(2);
    expect(s.total).toBe(4);
    expect(s.score).toBe(50);
    expect(s.avgResponseMs).toBe(200);
  });
});

describe('Yıldız Avcısı tur ilerlemesi', () => {
  it('tur ilerledikçe renk ve yıldız sayısı artar (üst sınırlar içinde)', () => {
    const params = starHunterParams(1, 800);
    const rng = createRng(5);
    const early = generateStarRound(params, 0, rng);
    const late = generateStarRound(params, 10, rng);
    expect(new Set(late.palette).size).toBeGreaterThan(new Set(early.palette).size);
    const extreme = generateStarRound(params, 100, rng);
    expect(extreme.palette.length).toBeLessThanOrEqual(6);
    expect(extreme.stars.length).toBeLessThanOrEqual(14);
  });
});
