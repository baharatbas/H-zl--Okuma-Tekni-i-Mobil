import { useAppStore } from '../store/appStore';
import { EXAMS } from '../core/exam/types';

/** Kullanıcının yolu: sınava hazırlık mı, ve hangi sınav. */
export function useTrack() {
  const isExam = useAppStore((s) => s.settings.purpose === 'exam');
  const target = useAppStore((s) => s.settings.examTarget);
  return { isExam, target, exam: EXAMS[target] ?? EXAMS.tyt };
}
