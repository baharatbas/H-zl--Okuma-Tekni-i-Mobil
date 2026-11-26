import { repositories } from '../repositories';
import type { DailyTaskRow } from '../repositories';
import { EXERCISES } from '../core/exercises/registry';
import type { ExerciseKey } from '../core/exercises/types';
import { findBuiltinText } from '../content/builtinTexts';
import { localDateString } from '../core/streak';

/** Görevin ekranda görünen açıklaması. */
export function dailyTitle(task: DailyTaskRow): string {
  if (task.kind === 'attention' || task.kind === 'recognition') return EXERCISES[task.ref as ExerciseKey]?.name ?? task.ref;
  return findBuiltinText(task.ref)?.title ?? task.ref;
}

export function dailyRoute(task: DailyTaskRow): string {
  const daily = `daily=${task.position}`;
  if (task.kind === 'attention' || task.kind === 'recognition') return `/exercise/${task.ref}?${daily}&difficulty=${task.difficulty}`;
  const text = repositories().texts.getByKey(task.ref);
  if (!text) return '/(tabs)';
  const base = task.kind === 'fluency' ? '/reader' : task.kind === 'comprehension' ? '/test' : '/memory';
  return `${base}/${text.id}?${daily}`;
}

/** Görev ekranı bitince çağrılır; `daily` parametresi yoksa hiçbir şey yapmaz. */
export function completeDaily(daily: string | undefined): void {
  if (daily !== undefined) repositories().daily.complete(localDateString(), Number(daily));
}
