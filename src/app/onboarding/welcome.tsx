import React from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingFrame } from '../../components/Onboarding';
import { Text_ } from '../../components/ui';
import { radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';

const FEATURES = [
  { icon: 'speedometer-outline', key: 'welcome1' },
  { icon: 'game-controller-outline', key: 'welcome2' },
  { icon: 'trending-up-outline', key: 'welcome3' },
] as const;

/** İlk açılış: hoş geldin. */
export default function WelcomeScreen() {
  const { colors } = useTheme();
  return (
    <OnboardingFrame title={t('onboarding.welcomeTitle')} subtitle={t('onboarding.welcomeSubtitle')} cta={t('onboarding.welcomeCta')} onCta={() => router.push('/onboarding/about')}>
      <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
        <View style={{ width: 120, height: 120, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="book" size={60} color={colors.onPrimary} />
        </View>
      </View>
      {FEATURES.map((f) => (
        <View key={f.key} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={f.icon} size={22} color={colors.primary} />
          </View>
          <Text_ style={{ flex: 1 }}>{t(`onboarding.${f.key}`)}</Text_>
        </View>
      ))}
    </OnboardingFrame>
  );
}
