import * as Haptics from 'expo-haptics';
import { getSettings } from '../store/appStore';

/** Kullanıcı ayarı kapalıysa hiçbir titreşim üretmez; cihaz desteklemezse sessizce geçer. */
export function haptic(kind: 'light' | 'success' | 'error' = 'light'): void {
  if (!getSettings().hapticsEnabled) return;
  const run =
    kind === 'success'
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : kind === 'error'
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  run.catch(() => undefined);
}
