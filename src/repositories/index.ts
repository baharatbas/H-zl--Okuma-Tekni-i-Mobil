import { getDb } from '../db/client';
import type { SqlDb } from '../db/types';
import { createProfileRepository, ProfileRepository } from './profileRepository';
import { createCourseRepository, CourseRepository } from './courseRepository';
import { createExerciseRepository, ExerciseRepository } from './exerciseRepository';
import { createTextRepository, TextRepository } from './textRepository';
import { createProgressRepository, ProgressRepository } from './progressRepository';
import { createParagraphRepository, ParagraphRepository } from './paragraphRepository';
import { createDailyRepository, DailyRepository } from './dailyRepository';

/**
 * Tüm veri erişimi bu katman üzerinden yapılır. Ekranlar SQL çağırmaz.
 * İleride backend eklenirse, bu arayüzleri uzak (HTTP) uygulamalarla değiştirmek yeterlidir.
 */
export interface Repositories {
  profile: ProfileRepository;
  course: CourseRepository;
  exercises: ExerciseRepository;
  texts: TextRepository;
  progress: ProgressRepository;
  paragraphs: ParagraphRepository;
  daily: DailyRepository;
}

export function createRepositories(db: SqlDb): Repositories {
  return {
    profile: createProfileRepository(db),
    course: createCourseRepository(db),
    exercises: createExerciseRepository(db),
    texts: createTextRepository(db),
    progress: createProgressRepository(db),
    paragraphs: createParagraphRepository(db),
    daily: createDailyRepository(db),
  };
}

export function repositories(): Repositories {
  return createRepositories(getDb());
}

export * from './courseRepository';
export * from './exerciseRepository';
export * from './textRepository';
export * from './progressRepository';
export * from './profileRepository';
export * from './dailyRepository';
