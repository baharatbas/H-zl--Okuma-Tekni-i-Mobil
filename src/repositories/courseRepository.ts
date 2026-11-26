import type { SqlDb } from '../db/types';
import { Level } from '../core/levels';
import { buildCourse, LessonStep, LessonType, isStepUnlocked } from '../core/course';
import { buildExamCourse } from '../core/exam/course';
import { parseSettings } from '../core/settings';

export interface LessonRow extends LessonStep {
  id: number;
  isCompleted: boolean;
  unlocked: boolean;
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
  /** Mevcut kursu siler; seviyeye ve profildeki amaca (genel / sınav) göre yenisini oluşturur. */
  start(level: Level): CourseView;
  /** Kurs silinir (baştan başlatma için ön adım). */
  reset(): void;
  completeLesson(courseId: number, orderIndex: number): CourseView;
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
    const base = rows.map((r) => ({ orderIndex: r.order_index, isCompleted: r.is_completed === 1 }));
    const lessons: LessonRow[] = rows.map((r) => ({
      id: r.id,
      orderIndex: r.order_index,
      type: r.type,
      contentRef: r.content_ref,
      unit: r.unit,
      difficulty: r.difficulty,
      isCompleted: r.is_completed === 1,
      unlocked: isStepUnlocked(base, r.order_index),
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

  return {
    getActive() {
      const row = db.getFirstSync<{ id: number }>('SELECT id FROM courses ORDER BY id DESC LIMIT 1');
      return row ? load(row.id) : null;
    },

    start(level) {
      const profile = db.getFirstSync<{ settings_json: string }>('SELECT settings_json FROM user_profile WHERE id = 1');
      const exam = parseSettings(profile?.settings_json).purpose === 'exam';
      let courseId = 0;
      db.withTransactionSync(() => {
        db.runSync('DELETE FROM courses');
        const res = db.runSync(
          'INSERT INTO courses (level, title, created_at, completed_at) VALUES (?, ?, ?, NULL)',
          [level, exam ? 'Sınav Paragraf Kursu' : TITLES[level], new Date().toISOString()],
        );
        courseId = res.lastInsertRowId;
        for (const step of exam ? buildExamCourse(level) : buildCourse(level)) {
          db.runSync(
            `INSERT INTO course_lessons (course_id, order_index, type, content_ref, unit, difficulty, is_completed)
             VALUES (?, ?, ?, ?, ?, ?, 0)`,
            [courseId, step.orderIndex, step.type, step.contentRef, step.unit, step.difficulty],
          );
        }
      });
      return load(courseId)!;
    },

    reset() {
      db.runSync('DELETE FROM courses');
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
