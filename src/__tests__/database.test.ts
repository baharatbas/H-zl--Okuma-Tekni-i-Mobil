import { createRng } from '../core/rng';
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
    expect(migrate(db)).toBe(11);
    expect(currentSchemaVersion(db)).toBe(11);
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
    expect(series.length).toBe(1); // grafik yalnızca ölçülen testlerden oluşur
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

describe('kalıcılık ve doğru grafik', () => {
  const outcome = (wpm: number) => ({ wordCount: 100, wpm, correctCount: 2, totalCount: 3, comprehension: 2 / 3 });

  it('metin düzenlense ya da silinse de test geçmişi korunur', () => {
    const { texts, progress } = setup();
    const id = texts.createUser('Benim', 'bir iki üç');
    const q = [{ question: 'Soru?', options: ['a', 'b'], correctIndex: 0 }];
    const testId = texts.createCustomTest(id, q);
    texts.recordTestResult(testId, outcome(200), 30000);
    expect(texts.createCustomTest(id, q)).toBe(testId);
    texts.clearCustomTests(id);
    expect(texts.getTest(id, 'custom')).toBeNull();
    texts.deleteUser(id);
    expect(texts.get(id)).toBeNull();
    expect(texts.list('user')).toHaveLength(0);
    expect(progress.getPerformanceSeries()).toHaveLength(1);
  });

  it('gerçekçi olmayan hızlar grafiğe girmez, sıralama eskiden yeniye', () => {
    const { texts, progress } = setup();
    const test = texts.getTest(texts.getByKey('builtin-sea')!.id)!;
    texts.recordTestResult(test.id, outcome(5000), 1000, '2026-11-01T10:00:00.000Z');
    texts.recordTestResult(texts.getTest(texts.getByKey('builtin-garden')!.id)!.id, outcome(240), 25000, '2026-11-03T10:00:00.000Z');
    texts.recordTestResult(texts.getTest(texts.getByKey('builtin-city')!.id)!.id, outcome(180), 33000, '2026-11-02T10:00:00.000Z');
    expect(progress.getPerformanceSeries().map((p) => p.wpm)).toEqual([180, 240]);
  });

  it('profil fotoğrafı veritabanında saklanır ve silinebilir', () => {
    const { profile } = setup();
    expect(profile.getPhoto()).toBeNull();
    profile.setPhoto({ mime: 'image/jpeg', base64: 'AAAA' });
    expect(profile.getPhoto()).toBe('data:image/jpeg;base64,AAAA');
    profile.setPhoto(null);
    expect(profile.getPhoto()).toBeNull();
  });
});

describe('egzersiz adımında seviye kuralı', () => {
  const result = (score: number) => ({ score, accuracy: score / 100, avgResponseMs: null, durationMs: 1000 });

  it('adım ancak 5 seviyenin hepsi en az 60 puanla geçilince tamamlanır', () => {
    const { course, exercises } = setup();
    const c = course.start('beginner');
    const step = c.lessons[0];
    const play = (difficulty: number, score: number) => {
      exercises.recordSession('tracking', result(score), { speedMs: 1000, difficulty, courseLessonId: step.id });
      return course.completeExerciseIfPassed(c.id, 0);
    };
    play(1, 100);
    play(1, 90); // aynı seviye bir kez sayılır
    play(2, 59); // yetersiz
    let view = play(3, 60);
    expect(view.lessons[0].passedLevels).toEqual([1, 3]);
    expect(view.lessons[0].isCompleted).toBe(false);
    expect(view.lessons[1].unlocked).toBe(false);
    play(2, 70);
    play(4, 80);
    view = play(5, 65);
    expect(view.lessons[0].isCompleted).toBe(true);
    expect(view.lessons[1].unlocked).toBe(true);
  });

  it('kurs dışında oynamak adıma sayılmaz ve yeni kurs sıfırdan başlar', () => {
    const { course, exercises } = setup();
    const c = course.start('beginner');
    exercises.recordSession('tracking', result(100), { speedMs: 1000, difficulty: 1 });
    expect(course.getActive()!.lessons[0].passedLevels).toEqual([]);
    exercises.recordSession('tracking', result(100), { speedMs: 1000, difficulty: 1, courseLessonId: c.lessons[0].id });
    expect(course.start('beginner').lessons[0].passedLevels).toEqual([]);
  });
});

describe('kütüphane özet listesi', () => {
  it('her hazır metni soru sayısıyla döner ve metnin tamamını taşımaz', () => {
    const db = openMemoryDb();
    migrate(db);
    seedBuiltins(db);
    seedBuiltins(db);
    const rows = createTextRepository(db).listSummaries();
    expect(rows).toHaveLength(BUILTIN_TEXTS.length);
    expect(rows.every((r) => (r.questions === 3 || r.questions === 5) && r.preview.length <= 200)).toBe(true);
  });
});

describe('süren kursun yeni derslerle uzaması', () => {
  it('tamamlanan adımları koruyup eksik adımları sona ekler', () => {
    const { db, course } = setup();
    const full = course.start('beginner');
    course.completeLesson(full.id, 0);
    db.runSync('DELETE FROM course_lessons WHERE course_id = ? AND order_index >= 16', [full.id]);
    const grown = course.getActive()!;
    expect(grown.lessons).toHaveLength(full.lessons.length);
    expect(grown.lessons[0].isCompleted).toBe(true);
    expect(course.getActive()!.lessons).toHaveLength(full.lessons.length);
  });
});

describe('seviye kuralı sonradan eklenen ünitelerde de geçerli', () => {
  it.each(['beginner', 'intermediate', 'advanced'] as const)('%s: her egzersiz adımı ancak 5 seviyeyle tamamlanır', (level) => {
    const { course, exercises } = setup();
    const c = course.start(level);
    const steps = c.lessons.filter((l) => l.type === 'exercise');
    expect(steps.some((l) => l.unit > 5)).toBe(true);
    for (const step of steps) {
      [1, 2, 3, 4, 5].forEach((difficulty, i) => {
        exercises.recordSession(step.contentRef as any, { score: 60, accuracy: 0.6, avgResponseMs: null, durationMs: 1000 }, { speedMs: 1000, difficulty, courseLessonId: step.id });
        const view = course.completeExerciseIfPassed(c.id, step.orderIndex);
        expect(view.lessons[step.orderIndex].isCompleted).toBe(i === 4);
      });
    }
  });
});

describe('taktik dersi alıştırmasıyla tamamlanır', () => {
  it('alıştırma 5 seviyeyle geçilmeden taktik tik almaz', () => {
    const { db, course, exercises } = setup();
    const c = course.start('beginner');
    const tactic = c.lessons.find((l) => l.contentRef.startsWith('tactic:'))!;
    db.runSync('UPDATE course_lessons SET is_completed = 1 WHERE course_id = ? AND order_index < ?', [c.id, tactic.orderIndex]);
    const at = (offset: number) => course.getActive()!.lessons[tactic.orderIndex + offset];
    expect(at(0).unlocked).toBe(true);
    expect(at(1).unlocked).toBe(true);
    expect(at(2).unlocked).toBe(false);
    const step = at(1);
    [1, 2, 3, 4, 5].forEach((difficulty) => {
      expect(at(0).isCompleted).toBe(false);
      exercises.recordSession(step.contentRef as any, { score: 80, accuracy: 0.8, avgResponseMs: null, durationMs: 1000 }, { speedMs: 1000, difficulty, courseLessonId: step.id });
      course.completeExerciseIfPassed(c.id, step.orderIndex);
    });
    expect(at(0).isCompleted).toBe(true);
    expect(at(1).isCompleted).toBe(true);
    expect(at(2).unlocked).toBe(true);
  });
});

describe('sınav kursu 15 ders', () => {
  it('15 üniteden oluşur ve eski 8 ünitelik kurs ilerleme korunarak uzar', () => {
    const { db, course } = setup();
    createProfileRepository(db).saveSettings({ purpose: 'exam' });
    const full = course.start('beginner');
    expect(new Set(full.lessons.map((l) => l.unit)).size).toBe(15);
    course.completeLesson(full.id, 0);
    db.runSync('DELETE FROM course_lessons WHERE course_id = ? AND unit > 8', [full.id]);
    const grown = course.getActive()!;
    expect(grown.lessons).toHaveLength(full.lessons.length);
    expect(grown.lessons[0].isCompleted).toBe(true);
  });
});

describe('paragraf soru bankası', () => {
  it('günün seti gün içinde sabit, günler arasında yinelenmez ve cevaplananlar düşer', () => {
    const { db } = setup();
    const repo = createParagraphRepository(db);
    const first = repo.dailySet('2026-12-01', 5, createRng(1));
    expect(repo.dailySet('2026-12-01', 5, createRng(2)).map((q) => q.id)).toEqual(first.map((q) => q.id));
    repo.record({ questionId: first[0].id, type: first[0].type, correct: true, durationMs: 1000 });
    expect(repo.dailySet('2026-12-01', 5, createRng(3))).toHaveLength(4);
    const second = repo.dailySet('2026-12-02', 5, createRng(1));
    expect(second.some((q) => first.some((f) => f.id === q.id))).toBe(false);
    const practiced = repo.practiceSet('main', 3, createRng(1));
    expect(practiced.some((q) => [...first, ...second].some((f) => f.id === q.id))).toBe(false);
  });
});

describe('64 günlük paragraf seti', () => {
  it('64 gün boyunca hiçbir soru yinelenmez, 65. günde en eskiden başlanır', () => {
    const { db } = setup();
    const repo = createParagraphRepository(db);
    const seen = new Set<string>();
    let first: string[] = [];
    for (let day = 0; day < 64; day++) {
      const date = new Date(Date.UTC(2027, 0, 1 + day)).toISOString().slice(0, 10);
      const set = repo.dailySet(date, 5, createRng(day));
      expect(set).toHaveLength(5);
      set.forEach((q) => {
        expect(seen.has(q.id)).toBe(false);
        seen.add(q.id);
      });
      if (day === 0) first = set.map((q) => q.id);
      db.runSync('UPDATE paragraph_shown SET shown_at = ? WHERE question_id IN (SELECT question_id FROM daily_paragraph WHERE date = ?)', [date, date]);
    }
    expect(seen.size).toBe(320);
    const again = repo.dailySet('2027-03-06', 5, createRng(99)).map((q) => q.id);
    expect(again.every((id) => first.includes(id))).toBe(true);
  });
});

describe.each(['work', 'books'] as const)('%s kursu 20 ders', (segment) => {
  it('20 üniteden oluşur ve eski 6 ünitelik kurs ilerleme korunarak uzar', () => {
    const { db, course } = setup();
    createProfileRepository(db).saveSettings({ purpose: segment });
    const full = course.start('beginner');
    expect(new Set(full.lessons.map((l) => l.unit)).size).toBe(20);
    expect(new Set(full.lessons.filter((l) => l.type === 'test').map((l) => l.contentRef)).size).toBe(20);
    course.completeLesson(full.id, 0);
    db.runSync('DELETE FROM course_lessons WHERE course_id = ? AND unit > 6', [full.id]);
    const grown = course.getActive()!;
    expect(grown.lessons).toHaveLength(full.lessons.length);
    expect(grown.lessons[0].isCompleted).toBe(true);
  });
});

describe('grup değişince ilerleme korunur', () => {
  it('her grubun kursu, adımları ve geçilen seviyeleri ayrı kalır', () => {
    const { db, course, exercises, progress } = setup();
    const profile = createProfileRepository(db);
    profile.saveSettings({ purpose: 'exam' });
    const student = course.ensure('beginner');
    const step = student.lessons[0];
    exercises.recordSession(step.contentRef as any, { score: 90, accuracy: 0.9, avgResponseMs: null, durationMs: 1000 }, { speedMs: 1000, difficulty: 1, courseLessonId: step.id });
    course.completeLesson(student.id, 0);

    profile.saveSettings({ purpose: 'work' });
    const worker = course.ensure('beginner');
    expect(worker.id).not.toBe(student.id);
    expect(worker.lessons.some((l) => l.isCompleted)).toBe(false);
    course.completeLesson(worker.id, 0);
    course.completeLesson(worker.id, 1);
    expect(progress.getSummary().completedLessons).toBe(2);

    profile.saveSettings({ purpose: 'exam' });
    const back = course.ensure('beginner');
    expect(back.id).toBe(student.id);
    expect(back.lessons[0].isCompleted).toBe(true);
    expect(back.lessons[0].passedLevels).toEqual([1]);
    expect(progress.getSummary().completedLessons).toBe(1);

    // Baştan başlatma yalnızca seçili grubu etkiler.
    course.start('beginner');
    profile.saveSettings({ purpose: 'work' });
    expect(course.getActive()!.lessons.filter((l) => l.isCompleted)).toHaveLength(2);
  });
});
