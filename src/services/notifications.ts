import * as Notifications from 'expo-notifications';
import { t } from '../i18n';

/**
 * Günlük yerel hatırlatıcıyı ayarlar. Önce mevcut zamanlanmış bildirimler temizlenir.
 * Dönen değer: hatırlatıcı başarıyla kuruldu mu (izin yoksa false).
 */
export async function syncDailyReminder(enabled: boolean, hour: number): Promise<boolean> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!enabled) return true;

    let permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) {
      permission = await Notifications.requestPermissionsAsync();
    }
    if (!permission.granted) return false;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: t('notifications.reminderTitle'),
        body: t('notifications.reminderBody'),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
      },
    });
    return true;
  } catch {
    return false;
  }
}
