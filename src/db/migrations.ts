/**
 * Şema migrasyonları. Her migrasyon bir kez, sürüm sırasıyla uygulanır ve `schema_version` tablosuna işlenir.
 * Yeni bir değişiklik için listenin sonuna yeni bir sürüm ekleyin; mevcut sürümleri DEĞİŞTİRMEYİN.
 */
export interface Migration {
  version: number;
  name: string;
  statements: string[];
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    statements: [
      `CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        level TEXT CHECK (level IN ('beginner','intermediate','advanced')),
        created_at TEXT NOT NULL,
        mode TEXT NOT NULL DEFAULT 'smart' CHECK (mode IN ('smart','free')),
        settings_json TEXT NOT NULL DEFAULT '{}'
      )`,
      `CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT NOT NULL,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        completed_at TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS course_lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        order_index INTEGER NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('exercise','reading','test')),
        content_ref TEXT NOT NULL,
        unit INTEGER NOT NULL DEFAULT 1,
        difficulty INTEGER NOT NULL DEFAULT 1,
        is_completed INTEGER NOT NULL DEFAULT 0,
        unlock_at TEXT,
        UNIQUE (course_id, order_index)
      )`,
      `CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        difficulty_params_json TEXT NOT NULL DEFAULT '{}'
      )`,
      `CREATE TABLE IF NOT EXISTS exercise_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
        started_at TEXT NOT NULL,
        duration_ms INTEGER NOT NULL,
        score INTEGER NOT NULL,
        accuracy REAL NOT NULL,
        speed_setting INTEGER NOT NULL,
        difficulty INTEGER NOT NULL DEFAULT 1,
        avg_response_ms INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS library_texts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        word_count INTEGER NOT NULL,
        source TEXT NOT NULL CHECK (source IN ('builtin','user')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS reading_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text_id INTEGER NOT NULL REFERENCES library_texts(id) ON DELETE CASCADE,
        started_at TEXT NOT NULL,
        wpm REAL NOT NULL,
        duration_ms INTEGER NOT NULL,
        word_count INTEGER NOT NULL,
        mode TEXT NOT NULL DEFAULT 'free'
      )`,
      `CREATE TABLE IF NOT EXISTS tests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text_id INTEGER NOT NULL REFERENCES library_texts(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN ('level','reading','custom')),
        created_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS test_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_id INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
        position INTEGER NOT NULL,
        question TEXT NOT NULL,
        options_json TEXT NOT NULL,
        correct_index INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS test_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_id INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
        started_at TEXT NOT NULL,
        correct_count INTEGER NOT NULL,
        total_count INTEGER NOT NULL,
        wpm REAL NOT NULL,
        comprehension_rate REAL NOT NULL,
        duration_ms INTEGER NOT NULL,
        word_count INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS daily_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        target_minutes INTEGER NOT NULL,
        completed_minutes REAL NOT NULL DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS streaks (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        current_streak INTEGER NOT NULL DEFAULT 0,
        best_streak INTEGER NOT NULL DEFAULT 0,
        last_active_date TEXT
      )`,
      `CREATE INDEX IF NOT EXISTS idx_lessons_course ON course_lessons(course_id, order_index)`,
      `CREATE INDEX IF NOT EXISTS idx_exercise_sessions_ex ON exercise_sessions(exercise_id, started_at)`,
      `CREATE INDEX IF NOT EXISTS idx_reading_sessions_started ON reading_sessions(started_at)`,
      `CREATE INDEX IF NOT EXISTS idx_test_results_started ON test_results(started_at)`,
      `CREATE INDEX IF NOT EXISTS idx_test_questions_test ON test_questions(test_id, position)`,
    ],
  },
  {
    version: 2,
    name: 'paragraph_attempts',
    statements: [
      `CREATE TABLE IF NOT EXISTS paragraph_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id TEXT NOT NULL,
        type TEXT NOT NULL,
        correct INTEGER NOT NULL,
        duration_ms INTEGER NOT NULL,
        created_at TEXT NOT NULL
      )`,
      'CREATE INDEX IF NOT EXISTS idx_paragraph_attempts_created ON paragraph_attempts(created_at)',
    ],
  },
  {
    version: 3,
    name: 'keep_history_and_profile_photo',
    statements: [
      'ALTER TABLE library_texts ADD COLUMN deleted_at TEXT',
      `CREATE TABLE IF NOT EXISTS profile_photo (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        mime TEXT NOT NULL,
        data TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
    ],
  },
  {
    version: 4,
    name: 'exercise_session_lesson',
    statements: [
      'ALTER TABLE exercise_sessions ADD COLUMN course_lesson_id INTEGER',
      'CREATE INDEX IF NOT EXISTS idx_exercise_sessions_lesson ON exercise_sessions(course_lesson_id)',
    ],
  },
  {
    version: 5,
    name: 'tests_text_index',
    statements: [
      // Kütüphane listesi her metnin testini arar; metin sayısı arttıkça indeks gerekir.
      'CREATE INDEX IF NOT EXISTS idx_tests_text ON tests(text_id)',
    ],
  },
  {
    version: 6,
    name: 'tactic_completes_with_exercise',
    statements: [
      // Alıştırması bitmeden tik almış taktik dersleri geri alınır.
      `UPDATE course_lessons SET is_completed = 0
       WHERE content_ref LIKE 'tactic:%' AND EXISTS (
         SELECT 1 FROM course_lessons n WHERE n.course_id = course_lessons.course_id
           AND n.order_index = course_lessons.order_index + 1 AND n.is_completed = 0)`,
    ],
  },
];

export const LATEST_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;
