import React from 'react';
import { router } from 'expo-router';
import { OnboardingFrame, NumberedRow } from '../../components/Onboarding';
import { Card, Text_ } from '../../components/ui';
import { spacing } from '../../theme';
import { useAppStore } from '../../store/appStore';
import { t } from '../../i18n';

/** İlk açılış 3/3: seviye testine hazırlık. Bitince bir daha gösterilmez. */
export default function StartScreen() {
  const updateSettings = useAppStore((s) => s.updateSettings);
  const finish = () => {
    updateSettings({ onboardingDone: true });
    router.replace('/level-test');
  };
  return (
    <OnboardingFrame
      step={3}
      total={3}
      title={t('onboarding.startTitle')}
      subtitle={t('onboarding.startSubtitle')}
      cta={t('onboarding.startCta')}
      onCta={finish}
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
