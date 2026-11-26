import { useAppStore } from '../store/appStore';
import { EXAMS } from '../core/exam/types';
import { segmentOf } from '../core/segments';

/** Kullanıcının grubu; öğrenciyse hedeflediği sınav. */
export function useTrack() {
  const segment = useAppStore((s) => segmentOf(s.settings.purpose));
  const isExam = segment === 'exam';
  const target = useAppStore((s) => s.settings.examTarget);
  return { segment, isExam, target, exam: EXAMS[target] ?? EXAMS.tyt };
}
