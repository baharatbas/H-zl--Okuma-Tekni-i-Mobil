import React from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { OnboardingFrame } from '../../components/Onboarding';
import { Text_ } from '../../components/ui';
import { radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';
import { useTrack } from '../../hooks/useTrack';

/** İlk açılış 2/3: uygulamanın ne yaptığı ve dürüst beklenti. */
export default function ValueScreen() {
  const { colors } = useTheme();
  const { isExam } = useTrack();
  const items: { icon: string; title: string; body: string }[] = isExam ? [
    { icon: 'search-outline', title: t('exam.v1Title'), body: t('exam.v1Body') },
    { icon: 'timer-outline', title: t('exam.v2Title'), body: t('exam.v2Body') },
    { icon: 'trending-up-outline', title: t('exam.v3Title'), body: t('exam.v3Body') },
  ] : [
    { icon: 'speedometer-outline', title: t('onboarding.v1Title'), body: t('onboarding.v1Body') },
    { icon: 'git-branch-outline', title: t('onboarding.v2Title'), body: t('onboarding.v2Body') },
    { icon: 'trending-up-outline', title: t('onboarding.v3Title'), body: t('onboarding.v3Body') },
  ];
  return (
    <OnboardingFrame
      step={2}
      total={3}
      title={isExam ? t('exam.valueTitle') : t('onboarding.valueTitle')}
      subtitle={isExam ? t('exam.valueSubtitle') : t('onboarding.valueSubtitle')}
      cta={t('common.next')}
      onCta={() => router.push('/onboarding/start')}
      footer={
        <View style={{ padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.primarySoft, gap: spacing.xs }}>
          <Text_ variant="label" style={{ color: colors.primary }}>{t('onboarding.honestTitle')}</Text_>
          <Text_ variant="caption">{isExam ? t('exam.honestBody') : t('onboarding.honestBody')}</Text_>
        </View>
      }
    >
      <View style={{ gap: spacing.lg }}>
        {items.map((it) => (
          <View key={it.title} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
            <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={it.icon as any} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text_ variant="heading">{it.title}</Text_>
              <Text_ muted>{it.body}</Text_>
            </View>
          </View>
        ))}
      </View>
    </OnboardingFrame>
  );
}
