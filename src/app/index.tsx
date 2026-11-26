import { Redirect } from 'expo-router';
import { useAppStore } from '../store/appStore';

/**
 * Açılış yönlendirmesi:
 * - İlk kurulumda hoş geldin → hedef → süre → başlangıç testi → program (bir kez),
 * - test tamamlanmadan seviye atanmaz; yarıda bırakılırsa akış yeniden açılır,
 * - aksi halde ana sekmeler.
 */
export default function Index() {
  const level = useAppStore((s) => s.level);
  const onboardingDone = useAppStore((s) => s.settings.onboardingDone);
  if (!onboardingDone && !level) return <Redirect href={'/onboarding/welcome' as any} />;
  if (!level) return <Redirect href="/onboarding/start" />;
  if (!onboardingDone) return <Redirect href={'/onboarding/ready' as any} />;
  return <Redirect href="/(tabs)" />;
}
