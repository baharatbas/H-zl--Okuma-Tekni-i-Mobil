import React from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { OnboardingFrame, NumberedRow } from '../../components/Onboarding';
import { Card, Text_ } from '../../components/ui';
import { radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';

/** İlk açılış 3/4: başlangıç testine hazırlık. Test bitmeden seviye ve performans kaydedilmez. */
export default function StartScreen() {
  const { colors } = useTheme();
  return (
    <OnboardingFrame
      step={3}
      total={4}
      title={t('onboarding.startTitle')}
      subtitle={t('onboarding.startSubtitle')}
      cta={t('onboarding.startCta')}
      onCta={() => router.push('/level-test?from=onboarding' as any)}
      footer={
        <View style={{ padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.primarySoft, gap: spacing.xs }}>
          <Text_ variant="label" style={{ color: colors.primary }}>{t('onboarding.honestTitle')}</Text_>
          <Text_ variant="caption">{t('onboarding.honestBody')}</Text_>
        </View>
      }
    >
      <Card style={{ gap: spacing.lg }}>
        <NumberedRow n={1} text={t('onboarding.startStep1')} />
        <NumberedRow n={2} text={t('onboarding.startStep2')} />
        <NumberedRow n={3} text={t('onboarding.startStep3')} />
      </Card>
      <Text_ variant="caption" muted>{t('onboarding.startNote')}</Text_>
    </OnboardingFrame>
  );
}
