import React, { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingFrame } from '../../components/Onboarding';
import { Card, Text_ } from '../../components/ui';
import { repositories } from '../../repositories';
import { SEGMENTS, segmentOf } from '../../core/segments';
import { localDateString } from '../../core/streak';
import { dailyTitle } from '../../services/daily';
import { useAppStore } from '../../store/appStore';
import { spacing, useTheme } from '../../theme';
import { t } from '../../i18n';

/** İlk açılış 4/4: seviye ve ilk günlük antrenman hazır. */
export default function ReadyScreen() {
  const { colors } = useTheme();
  const level = useAppStore((s) => s.level);
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const segment = segmentOf(settings.purpose);
  const [plan] = useState(() => repositories().daily.getPlan(localDateString(), level ?? 'beginner', segment, settings.dailyGoalMinutes));

  const finish = () => {
    updateSettings({ onboardingDone: true });
    router.replace('/(tabs)');
  };

  return (
    <OnboardingFrame step={4} total={4} title={t('onboarding.readyTitle')} subtitle={t('onboarding.readySubtitle')} cta={t('onboarding.readyCta')} onCta={finish}>
      <Card style={{ gap: spacing.sm }}>
        <Text_ variant="heading">{level ? t('levelTest.resultLevel', { level: t(`levels.${level}`) }) : ''}</Text_>
        <Text_ muted>{`${SEGMENTS[segment].label} · ${t('onboarding.perDay', { minutes: settings.dailyGoalMinutes })}`}</Text_>
      </Card>
      <Card style={{ gap: spacing.md }}>
        <Text_ variant="heading">{t('daily.title')}</Text_>
        {plan.map((task) => (
          <View key={task.position} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Ionicons name="ellipse-outline" size={18} color={colors.primary} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text_ variant="label">{t(`daily.kind.${task.kind}`)}</Text_>
              <Text_ variant="caption" muted numberOfLines={1}>{dailyTitle(task)}</Text_>
            </View>
            <Text_ variant="caption" muted>{t('today.minutes', { count: task.minutes })}</Text_>
          </View>
        ))}
      </Card>
    </OnboardingFrame>
  );
}
