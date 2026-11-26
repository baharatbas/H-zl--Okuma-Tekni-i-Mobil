import { Stack } from 'expo-router';

/** İlk açılış akışı: kendi başlığı olmayan, tam ekran adımlar. */
export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
