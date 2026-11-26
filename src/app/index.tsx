import { Redirect } from 'expo-router';
import { useAppStore } from '../store/appStore';

/**
 * Açılış yönlendirmesi:
 * - İlk kurulumda tanışma akışı (bir kez),
 * - seviye yoksa seviye testi başlangıcı,
 * - aksi halde ana sekmeler.
 */
export default function Index() {
  const level = useAppStore((s) => s.level);
  const onboardingDone = useAppStore((s) => s.settings.onboardingDone);
  if (!onboardingDone && !level) return <Redirect href="/onboarding/about" />;
  if (!level) return <Redirect href="/onboarding/start" />;
  return <Redirect href="/(tabs)" />;
}
