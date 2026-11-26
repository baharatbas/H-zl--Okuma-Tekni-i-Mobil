import React from 'react';
import { router } from 'expo-router';
import { ChoiceCard, OnboardingFrame } from '../../components/Onboarding';
import { DAILY_MINUTES } from '../../core/dailyPlan';
import { useAppStore } from '../../store/appStore';
import { t } from '../../i18n';

/** İlk açılış 2/4: günlük çalışma süresi. Sonradan Ayarlar'dan değiştirilebilir. */
export default function MinutesScreen() {
  const minutes = useAppStore((s) => s.settings.dailyGoalMinutes);
  const updateSettings = useAppStore((s) => s.updateSettings);
  return (
    <OnboardingFrame step={2} total={4} title={t('onboarding.minutesTitle')} subtitle={t('onboarding.minutesSubtitle')} cta={t('common.next')} onCta={() => router.push('/onboarding/start')}>
      {DAILY_MINUTES.map((m) => (
        <ChoiceCard key={m} title={t('today.minutes', { count: m })} body={t(`onboarding.minutes${m}`)} selected={minutes === m} onPress={() => updateSettings({ dailyGoalMinutes: m })} />
      ))}
    </OnboardingFrame>
  );
}
