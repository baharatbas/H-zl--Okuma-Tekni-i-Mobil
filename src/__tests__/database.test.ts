/**
 * @jest-environment node
 */
import { openMemoryDb } from './helpers/nodeSqlite';
import { migrate, currentSchemaVersion } from '../db/migrate';
import { seedBuiltins } from '../db/seed';
import { createProfileRepository } from '../repositories/profileRepository';
import { createCourseRepository } from '../repositories/courseRepository';
import { createExerciseRepository } from '../repositories/exerciseRepository';
import { createTextRepository } from '../repositories/textRepository';
import { createProgressRepository } from '../repositories/progressRepository';
import { scoreTest } from '../core/testScoring';
import { createParagraphRepository } from '../repositories/paragraphRepository';
import { BUILTIN_TEXTS } from '../content/builtinTexts';
import { EXERCISE_KEYS } from '../core/exercises/registry';

function setup() {
  const db = openMemoryDb();
  migrate(db);
  seedBuiltins(db);
  return {
    db,
    profile: createProfileRepository(db),
    course: createCourseRepository(db),
    exercises: createExerciseRepository(db),
    texts: createTextRepository(db),
    progress: createProgressRepository(db),
  };
}

describe('migrasyonlar', () => {
  it('şemayı en son sürüme getirir ve tekrar çalıştırıldığında hiçbir şey uygulamaz', () => {
    const db = openMemoryDb();
    expect(migrate(db)).toBe(2);
    expect(currentSchemaVersion(db)).toBe(2);
    expect(migrate(db)).toBe(0);
  });

  it('tohumlama idempotent: iki kez çalışınca kayıt çoğalmaz', () => {
    const { db } = setup();
    seedBuiltins(db);
    const exCount = db.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM exercises')!.n;
    const textCount = db.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM library_texts')!.n;
    const testCount = db.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM tests')!.n;
    expect(exCount).toBe(EXERCISE_KEYS.length);
    expect(textCount).toBe(BUILTIN_TEXTS.length);
    expect(testCount).toBe(BUILTIN_TEXTS.length);
  });
});

describe('profil ve ayarlar', () => {
  it('seviye ve ayarlar kalıcı olarak saklanır', () => {
    const { profile } = setup();
    expect(profile.get().level).toBeNull();
    profile.setLevel('intermediate');
    profile.saveSettings({ dailyGoalMinutes: 25, theme: 'dark' });
    const p = profile.get();
    expect(p.level).toBe('intermediate');
    expect(p.settings.dailyGoalMinutes).toBe(25);
    expect(p.settings.theme).toBe('dark');
    expect(p.settings.readingWpm).toBe(250); // eksik alanlar varsayılandan gelir
  });
});

describe('kurs', () => {
  it('kurs oluşturulur, adımlar kilitli başlar ve tamamlama sonrası açılır', () => {
    const { course } = setup();
    const c = course.start('beginner');
    expect(c.lessons.length).toBeGreaterThan(0);
    expect(c.lessons[0].unlocked).toBe(true);
    expect(c.lessons[1].unlocked).toBe(false);

    const after = course.completeLesson(c.id, 0);
    expect(after.lessons[0].isCompleted).toBe(true);
    expect(after.lessons[1].unlocked).toBe(true);
  });

  it('yeni kurs başlatmak eskisini siler', () => {
    const { course, db } = setup();
    course.start('beginner');
    course.start('advanced');
    const n = db.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM courses')!.n;
    expect(n).toBe(1);
    expect(course.getActive()!.level).toBe('advanced');
  });

  it('tüm adımlar tamamlanınca kurs completed_at alır', () => {
    const { course } = setup();
    const c = course.start('beginner');
    let view = c;
    for (const l of c.lessons) view = course.completeLesson(c.id, l.orderIndex);
    expect(view.completedAt).not.toBeNull();
  });

  it('kurs sıfırlanınca aktif kurs kalmaz', () => {
    const { course } = setup();
    course.start('intermediate');
    course.reset();
    expect(course.getActive()).toBeNull();
  });
});

describe('egzersiz kayıtları', () => {
  it('oturum kaydedilir ve listelenir', () => {
    const { exercises } = setup();
    exercises.recordSession(
      'star_hunter',
      { score: 75, accuracy: 0.75, avgResponseMs: 1234.4, durationMs: 60000 },
      { speedMs: 800, difficulty: 2 },
    );
    const list = exercises.listSessions('star_hunter');
    expect(list.length).toBe(1);
    expect(list[0].score).toBe(75);
    expect(list[0].avgResponseMs).toBe(1234);
    expect(exercises.countSessions()).toBe(1);
  });
});

describe('metinler', () => {
  it('kullanıcı metni eklenir, düzenlenir ve silinir; yerleşik metin silinemez', () => {
    const { texts } = setup();
    const id = texts.createUser('Deneme', 'bir iki üç dört');
    expect(texts.get(id)!.wordCount).toBe(4);
    texts.updateUser(id, 'Deneme 2', 'beş altı');
    expect(texts.get(id)!.title).toBe('Deneme 2');
    expect(texts.get(id)!.wordCount).toBe(2);
    texts.deleteUser(id);
    expect(texts.get(id)).toBeNull();

    const builtin = texts.getByKey('builtin-sea')!;
    texts.deleteUser(builtin.id);
    expect(texts.get(builtin.id)).not.toBeNull();
  });

  it('seviye testi seviye tipiyle gelir; test sonucu ve okuma kaydı ilerlemeye yansır', () => {
    const { texts, progress } = setup();
    const level = texts.getByKey('builtin-level-test')!;
    const test = texts.getTest(level.id, 'level')!;
    expect(test.type).toBe('level');
    expect(test.questions.length).toBe(3);

    const answers = test.questions.map((q) => ({ correctIndex: q.correctIndex, selectedIndex: q.correctIndex }));
    const outcome = scoreTest(level.body, 60_000, answers);
    texts.recordTestResult(test.id, outcome, 60_000);
    texts.recordReadingSession(level.id, outcome.wpm, 60_000, level.wordCount, 'chunk');

    const series = progress.getPerformanceSeries();
    expect(series.length).toBe(2);
    expect(progress.getSummary().testsTaken).toBe(1);
    expect(progress.getSummary().wordsRead).toBeGreaterThan(0);
  });

  it('özel test sorularıyla oluşturulabilir', () => {
    const { texts } = setup();
    const id = texts.createUser('Özel', 'bir iki üç');
    const testId = texts.createCustomTest(id, [
      { question: 'Kaç kelime?', options: ['1', '2', '3'], correctIndex: 2 },
    ]);
    const t = texts.getTest(id, 'custom')!;
    expect(t.id).toBe(testId);
    expect(t.questions[0].options).toEqual(['1', '2', '3']);
  });
});

describe('ilerleme ve seri', () => {
  it('günlük hedef dakikaları ve seri birikir', () => {
    const { progress } = setup();
    const r1 = progress.addActivity('2026-05-01', 5, 10);
    expect(r1.goal.completedMinutes).toBe(5);
    expect(r1.streak.currentStreak).toBe(1);
    const r2 = progress.addActivity('2026-05-01', 6, 10);
    expect(r2.goal.completedMinutes).toBe(11);
    expect(r2.goal.progress).toBe(1);
    const r3 = progress.addActivity('2026-05-02', 3, 10);
    expect(r3.streak.currentStreak).toBe(2);
    expect(progress.getStreak('2026-05-03').current).toBe(2);
    expect(progress.getStreak('2026-05-05').current).toBe(0);
  });
});

describe('sınav yolu', () => {
  it('amaç sınav ise paragraf kursu oluşturulur ve denemeler kaydedilir', () => {
    const { db, profile, course } = setup();
    profile.saveSettings({ purpose: 'exam' });
    const c = course.start('beginner');
    expect(c.title).toBe('Sınav Paragraf Kursu');
    expect(c.lessons.some((l) => l.contentRef === 'para:main')).toBe(true);

    const repo = createParagraphRepository(db);
    repo.record({ questionId: 'main-1', type: 'main', correct: false, durationMs: 40000 });
    repo.record({ questionId: 'main-2', type: 'main', correct: true, durationMs: 30000 });
    expect(repo.list().map((a) => a.questionId)).toEqual(['main-1', 'main-2']);
    expect(repo.list()[1].correct).toBe(true);
  });
});
