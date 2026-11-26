import { buildCourse } from '../core/course';
import { buildExamCourse } from '../core/exam/course';
import { buildSegmentCourse, courseSegment, isTrackMismatch } from '../core/segmentCourse';
import { SEGMENT_KEYS, SEGMENTS } from '../core/segments';
import { isExerciseKey } from '../core/exercises/registry';
import { findTactic } from '../content/tactics';
import { findBuiltinText } from '../content/builtinTexts';
import { openMemoryDb } from './helpers/nodeSqlite';
import { migrate } from '../db/migrate';
import { seedBuiltins } from '../db/seed';
import { createDailyRepository } from '../repositories/dailyRepository';
import { createCourseRepository } from '../repositories/courseRepository';
import { createProfileRepository } from '../repositories/profileRepository';

describe('dört kullanıcı grubu', () => {
  it('her grubun geçerli egzersiz havuzları var', () => {
    expect(SEGMENT_KEYS).toHaveLength(4);
    for (const key of SEGMENT_KEYS) {
      const s = SEGMENTS[key];
      for (const list of [s.recommended, s.attention, s.recognition]) {
        expect(list.length).toBeGreaterThanOrEqual(4);
        expect(list.every(isExerciseKey)).toBe(true);
      }
    }
  });
  it('çalışan ve kitap okuru kursları geçerli içerik gösterir ve ayırt edilir', () => {
    for (const segment of ['work', 'books'] as const) {
      const steps = buildSegmentCourse(segment, 'beginner');
      for (const s of steps) {
        if (s.type === 'exercise') expect(isExerciseKey(s.contentRef)).toBe(true);
        else expect(findTactic(s.contentRef) ?? findBuiltinText(s.contentRef)).toBeTruthy();
      }
      expect(courseSegment(steps)).toBe(segment);
    }
    expect(courseSegment(buildCourse('beginner'))).toBe('self');
    expect(courseSegment(buildExamCourse('beginner'))).toBe('exam');
    expect(isTrackMismatch(buildCourse('beginner'), 'work')).toBe(true);
  });
  it('seçilen gruba göre kurs ve günlük antrenman üretilir', () => {
    const db = openMemoryDb();
    migrate(db);
    seedBuiltins(db);
    const profile = createProfileRepository(db);
    const course = createCourseRepository(db);
    const daily = createDailyRepository(db);
    for (const segment of SEGMENT_KEYS) {
      profile.saveSettings({ purpose: segment });
      expect(courseSegment(course.start('beginner').lessons)).toBe(segment);
      daily.reset('2026-11-27');
      const plan = daily.getPlan('2026-11-27', 'beginner', segment);
      expect(SEGMENTS[segment].attention).toContain(plan[0].ref);
      expect(SEGMENTS[segment].recognition).toContain(plan[1].ref);
    }
  });
});
