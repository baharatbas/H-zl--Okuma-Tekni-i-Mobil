import { adaptDifficulty, ATTENTION, buildDailyPlan, DailyInput, RECOGNITION } from '../core/dailyPlan';
import { memoryOptions, scoreMemory } from '../core/memoryChallenge';
import { createRng } from '../core/rng';
import { BUILTIN_TEXTS } from '../content/builtinTexts';
import { countWords } from '../core/metrics';
import { openMemoryDb } from './helpers/nodeSqlite';
import { migrate } from '../db/migrate';
import { seedBuiltins } from '../db/seed';
import { createDailyRepository } from '../repositories/dailyRepository';

const input: DailyInput = {
  date: '2026-11-27',
  level: 'beginner',
  history: [],
  comprehension: null,
  texts: BUILTIN_TEXTS.map((t) => ({ key: t.key, words: countWords(t.body) })),
  seenTexts: [],
  previousRefs: [],
};

describe('günlük antrenman planı', () => {
  it('beş görev, spec’teki XP değerleri ve ayrı metinler', () => {
    const plan = buildDailyPlan(input);
    expect(plan.map((p) => p.kind)).toEqual(['attention', 'recognition', 'fluency', 'comprehension', 'memory']);
    expect(plan.map((p) => p.xp)).toEqual([20, 20, 30, 30, 20]);
    expect(ATTENTION).toContain(plan[0].ref);
    expect(RECOGNITION).toContain(plan[1].ref);
    expect(plan[2].ref).not.toBe(plan[3].ref);
    expect(plan[4].ref).toBe(plan[3].ref);
    expect(buildDailyPlan(input)).toEqual(plan);
  });
  it('bir önceki günün egzersiz ve metinleri tekrar etmez', () => {
    let previousRefs: string[] = [];
    for (let day = 1; day <= 28; day++) {
      const plan = buildDailyPlan({ ...input, date: `2026-12-${String(day).padStart(2, '0')}`, previousRefs });
      for (const p of plan) expect(previousRefs).not.toContain(p.ref);
      previousRefs = plan.map((p) => p.ref);
    }
  });
  it('zorluk son puanlara göre artar, azalır ya da kalır', () => {
    const h = (score: number) => [{ key: 'schulte', difficulty: 3, score }];
    expect(adaptDifficulty(h(90), 'schulte', 'beginner')).toBe(4);
    expect(adaptDifficulty(h(40), 'schulte', 'beginner')).toBe(2);
    expect(adaptDifficulty(h(70), 'schulte', 'beginner')).toBe(3);
    expect(adaptDifficulty([], 'schulte', 'advanced')).toBe(5);
  });
  it('anlama düşükse daha kısa metin seçilir', () => {
    const words = (c: number) => {
      const key = buildDailyPlan({ ...input, comprehension: c })[2].ref;
      return input.texts.find((t) => t.key === key)!.words;
    };
    expect(words(0.3)).toBeLessThanOrEqual(words(0.95));
  });
  it('plan gün içinde saklanır ve tamamlanan görevin XP’si toplanır', () => {
    const db = openMemoryDb();
    migrate(db);
    seedBuiltins(db);
    const daily = createDailyRepository(db);
    const first = daily.getPlan('2026-11-27', 'beginner');
    daily.complete('2026-11-27', 2);
    daily.complete('2026-11-27', 2);
    const again = daily.getPlan('2026-11-27', 'advanced');
    expect(again.map((p) => p.ref)).toEqual(first.map((p) => p.ref));
    expect(again.filter((p) => p.completed).map((p) => p.position)).toEqual([2]);
    expect(daily.totalXp()).toBe(30);
  });
});

describe('hafıza görevi', () => {
  it('yarısı metinde geçen, yarısı geçmeyen kelime sunar ve puanlar', () => {
    const [text, ...rest] = BUILTIN_TEXTS;
    const options = memoryOptions(text.body, rest.map((t) => t.body), createRng(3));
    expect(options).toHaveLength(8);
    expect(options.filter((o) => o.inText)).toHaveLength(4);
    const right = options.filter((o) => o.inText).map((o) => o.word);
    expect(scoreMemory(options, right)).toBe(8);
    expect(scoreMemory(options, [])).toBe(4);
  });
});
