import type { SqlDb } from '../db/types';
import { Level } from '../core/levels';
import { buildCourse, LessonStep, LessonType, isStepUnlocked, nextDifficulty, PASS_SCORE } from '../core/course';
import { buildExamCourse } from '../core/exam/course';
import { buildSegmentCourse } from '../core/segmentCourse';
import { segmentOf } from '../core/segments';
import { parseSettings } from '../core/settings';
import { findTactic } from '../content/tactics';

export interface LessonRow extends LessonStep {
  id: number;
  isCompleted: boolean;
  unlocked: boolean;
  /** Egzersiz adımında bu kursta geçilmiş zorluk seviyeleri. */
  passedLevels: number[];
}

export interface CourseView {
  id: number;
  level: Level;
  title: string;
  createdAt: string;
  completedAt: string | null;
  lessons: LessonRow[];
}

export interface CourseRepository {
  getActive(): CourseView | null;
  /** Seçili grubun kursunu siler ve yenisini oluşturur; diğer grupların kursları korunur. */
  start(level: Level): CourseView;
  /** Seçili grubun kursu varsa onu (ilerlemesiyle) döner, yoksa oluşturur. */
  ensure(level: Level): CourseView;
  /** Seçili grubun kursu silinir (baştan başlatma için ön adım). */
  reset(): void;
  completeLesson(courseId: number, orderIndex: number): CourseView;
  /** Egzersiz adımını yalnızca tüm zorluk seviyeleri geçildiyse tamamlar. */
  completeExerciseIfPassed(courseId: number, orderIndex: number): CourseView;
}

const TITLES: Record<Level, string> = {
  beginner: 'Başlangıç Kursu',
  intermediate: 'Orta Seviye Kurs',
  advanced: 'İleri Seviye Kurs',
};

export function createCourseRepository(db: SqlDb): CourseRepository {
  function load(courseId: number): CourseView | null {
    const course = db.getFirstSync<{
      id: number;
      level: Level;
      title: string;
      created_at: string;
      completed_at: string | null;
    }>('SELECT id, level, title, created_at, completed_at FROM courses WHERE id = ?', [courseId]);
    if (!course) return null;

    const rows = db.getAllSync<{
      id: number;
      order_index: number;
      type: LessonType;
      content_ref: string;
      unit: number;
      difficulty: number;
      is_completed: number;
    }>(
      `SELECT id, order_index, type, content_ref, unit, difficulty, is_completed
       FROM course_lessons WHERE course_id = ? ORDER BY order_index`,
      [courseId],
    );
    const base = rows.map((r) => ({ orderIndex: r.order_index, isCompleted: r.is_completed === 1, contentRef: r.content_ref }));
    // Tüm adımların geçilen seviyeleri tek sorguda okunur (adım başına sorgu yok).
    const passed = new Map<number, number[]>();
    for (const row of db.getAllSync<{ course_lesson_id: number; difficulty: number }>(
      `SELECT DISTINCT s.course_lesson_id, s.difficulty FROM exercise_sessions s
       JOIN course_lessons l ON l.id = s.course_lesson_id
       WHERE l.course_id = ? AND s.score >= ? ORDER BY s.difficulty`,
      [courseId, PASS_SCORE],
    )) {
      passed.set(row.course_lesson_id, [...(passed.get(row.course_lesson_id) ?? []), row.difficulty]);
    }
    const lessons: LessonRow[] = rows.map((r) => ({
      id: r.id,
      orderIndex: r.order_index,
      type: r.type,
      contentRef: r.content_ref,
      unit: r.unit,
      difficulty: r.difficulty,
      isCompleted: r.is_completed === 1,
      unlocked: isStepUnlocked(base, r.order_index),
      passedLevels: passed.get(r.id) ?? [],
    }));

    return {
      id: course.id,
      level: course.level,
      title: course.title,
      createdAt: course.created_at,
      completedAt: course.completed_at,
      lessons,
    };
  }

  /** Eski bir genel ya da sınav kursuna sonradan eklenen adımları sona ekler; tamamlananlar korunur. */
  function extend(courseId: number): void {
    const course = db.getFirstSync<{ level: Level }>('SELECT level FROM courses WHERE id = ?', [courseId]);
    if (!course) return;
    const rows = db.getAllSync<{ type: string; content_ref: string }>(
      'SELECT type, content_ref FROM course_lessons WHERE course_id = ? ORDER BY order_index',
      [courseId],
    );
    // Yalnızca mevcut adımlar güncel bir planın başıyla birebir aynıysa uzatılır.
    const steps = [buildCourse(course.level), buildExamCourse(course.level), buildSegmentCourse('work', course.level), buildSegmentCourse('books', course.level)].find(
      (plan) => rows.length > 0 && rows.length < plan.length && rows.every((r, i) => r.type === plan[i].type && r.content_ref === plan[i].contentRef),
    );
    if (!steps) return;
    db.withTransactionSync(() => {
      for (const step of steps.slice(rows.length)) insertStep(courseId, step);
      db.runSync('UPDATE courses SET completed_at = NULL WHERE id = ?', [courseId]);
    });
  }

  function insertStep(courseId: number, step: LessonStep): void {
    db.runSync(
      `INSERT INTO course_lessons (course_id, order_index, type, content_ref, unit, difficulty, is_completed)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [courseId, step.orderIndex, step.type, step.contentRef, step.unit, step.difficulty],
    );
  }

  /** Profilde seçili kullanıcı grubu; her grubun kendi kursu vardır. */
  const currentSegment = () => {
    const profile = db.getFirstSync<{ settings_json: string }>('SELECT settings_json FROM user_profile WHERE id = 1');
    return segmentOf(parseSettings(profile?.settings_json).purpose);
  };

  return {
    ensure(level) {
      return this.getActive() ?? this.start(level);
    },

    getActive() {
      const row = db.getFirstSync<{ id: number }>('SELECT id FROM courses WHERE segment = ? ORDER BY id DESC LIMIT 1', [currentSegment()]);
      if (!row) return null;
      extend(row.id);
      return load(row.id);
    },

    start(level) {
      const segment = currentSegment();
      const plan = segment === 'exam' ? buildExamCourse(level) : segment === 'self' ? buildCourse(level) : buildSegmentCourse(segment, level);
      let courseId = 0;
      db.withTransactionSync(() => {
        db.runSync('DELETE FROM courses WHERE segment = ?', [segment]);
        const res = db.runSync(
          'INSERT INTO courses (level, title, created_at, completed_at, segment) VALUES (?, ?, ?, NULL, ?)',
          [level, segment === 'exam' ? 'Sınav Paragraf Kursu' : segment === 'work' ? 'İş Okuması Kursu' : segment === 'books' ? 'Kitap Okuru Kursu' : TITLES[level], new Date().toISOString(), segment],
        );
        courseId = res.lastInsertRowId;
        for (const step of plan) {
          insertStep(courseId, step);
        }
      });
      return load(courseId)!;
    },

    reset() {
      db.runSync('DELETE FROM courses WHERE segment = ?', [currentSegment()]);
    },

    completeExerciseIfPassed(courseId, orderIndex) {
      const view = load(courseId)!;
      const lesson = view.lessons.find((l) => l.orderIndex === orderIndex);
      if (!lesson || lesson.isCompleted || nextDifficulty(lesson.passedLevels) !== null) return view;
      // Alıştırmanın taktik dersi de onunla birlikte tamamlanır.
      const before = view.lessons.find((l) => l.orderIndex === orderIndex - 1);
      if (before && findTactic(before.contentRef)) this.completeLesson(courseId, before.orderIndex);
      return this.completeLesson(courseId, orderIndex);
    },

    completeLesson(courseId, orderIndex) {
      db.withTransactionSync(() => {
        db.runSync(
          'UPDATE course_lessons SET is_completed = 1 WHERE course_id = ? AND order_index = ?',
          [courseId, orderIndex],
        );
        const remaining = db.getFirstSync<{ n: number }>(
          'SELECT COUNT(*) AS n FROM course_lessons WHERE course_id = ? AND is_completed = 0',
          [courseId],
        );
        if (remaining && remaining.n === 0) {
          db.runSync('UPDATE courses SET completed_at = ? WHERE id = ?', [new Date().toISOString(), courseId]);
        }
      });
      return load(courseId)!;
    },
  };
}
