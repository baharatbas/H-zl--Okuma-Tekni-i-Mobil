import React, { useState } from 'react';
import { router } from 'expo-router';
import { TextInput, View } from 'react-native';
import { ChoiceCard, OnboardingFrame } from '../../components/Onboarding';
import { EXAMS, ExamTarget } from '../../core/exam/types';
import { Chip, Text_ } from '../../components/ui';
import { useAppStore } from '../../store/appStore';
import { radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';

/** İlk açılış 1/3: kullanım amacı ve isteğe bağlı hitap adı. */
export default function AboutScreen() {
  const { colors } = useTheme();
  const updateSettings = useAppStore((s) => s.updateSettings);
  const [purpose, setPurpose] = useState<'exam' | 'self' | null>(null);
  const [name, setName] = useState('');
  const [target, setTarget] = useState<ExamTarget>('tyt');

  const next = () => {
    updateSettings({ purpose, examTarget: target, displayName: name.trim() });
    router.push('/onboarding/value');
  };

  return (
    <OnboardingFrame
      step={1}
      total={3}
      title={t('onboarding.aboutTitle')}
      subtitle={t('onboarding.aboutSubtitle')}
      cta={t('common.next')}
      onCta={next}
      ctaDisabled={purpose === null}
    >
      <ChoiceCard title={t('onboarding.purposeExam')} body={t('onboarding.purposeExamBody')} selected={purpose === 'exam'} onPress={() => setPurpose('exam')} />
      <ChoiceCard title={t('onboarding.purposeSelf')} body={t('onboarding.purposeSelfBody')} selected={purpose === 'self'} onPress={() => setPurpose('self')} />

      {purpose === 'exam' ? (
        <View style={{ gap: spacing.sm }}>
          <Text_ variant="label">{t('exam.whichExam')}</Text_>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {(Object.keys(EXAMS) as ExamTarget[]).map((key) => (
              <Chip key={key} label={EXAMS[key].label} selected={target === key} onPress={() => setTarget(key)} />
            ))}
          </View>
        </View>
      ) : null}

      <TextInput
        accessibilityLabel={t('onboarding.nameLabel')}
        placeholder={t('onboarding.namePlaceholder')}
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
        maxLength={24}
        returnKeyType="done"
        style={{ minHeight: 52, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.md, fontSize: 16, color: colors.text }}
      />
      <Text_ variant="caption" muted>{t('onboarding.nameHint')}</Text_>
    </OnboardingFrame>
  );
}
