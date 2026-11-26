import React from 'react';
import { Alert, View } from 'react-native';
import { Chip, Text_ } from './ui';
import { EXAMS, ExamTarget } from '../core/exam/types';
import { repositories } from '../repositories';
import { useAppStore } from '../store/appStore';
import { spacing } from '../theme';
import { t } from '../i18n';

/** Yolu ya da sınavı değiştirir; yol değişirse onayla yeni kurs oluşturulur. */
function changeTrack(patch: { purpose?: 'exam' | 'self'; examTarget?: ExamTarget }, onChanged?: () => void) {
  const { settings, level, updateSettings } = useAppStore.getState();
  const wasExam = settings.purpose === 'exam';
  const willBeExam = (patch.purpose ?? settings.purpose) === 'exam';
  const apply = () => {
    updateSettings(patch);
    if (wasExam !== willBeExam && level) repositories().course.start(level);
    onChanged?.();
  };
  if (wasExam === willBeExam || !level) return apply();
  Alert.alert(t('exam.switchTitle'), t('exam.switchMessage'), [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('exam.switchConfirm'), onPress: apply },
  ]);
}

/** Çalışma yolu seçimi: kişisel gelişim ya da sınava hazırlık (ve hangi sınav). */
export function TrackSelector({ onChanged }: { onChanged?: () => void }) {
  const purpose = useAppStore((s) => s.settings.purpose);
  const target = useAppStore((s) => s.settings.examTarget);
  const isExam = purpose === 'exam';
  const row = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: spacing.sm };
  return (
    <View style={{ gap: spacing.md }}>
      <Text_ variant="heading">{t('exam.trackTitle')}</Text_>
      <View style={row}>
        <Chip label={t('exam.trackSelf')} selected={!isExam} onPress={() => isExam && changeTrack({ purpose: 'self' }, onChanged)} />
        <Chip label={t('exam.trackExam')} selected={isExam} onPress={() => !isExam && changeTrack({ purpose: 'exam' }, onChanged)} />
      </View>
      {isExam ? (
        <View style={row}>
          {(Object.keys(EXAMS) as ExamTarget[]).map((key) => (
            <Chip key={key} label={EXAMS[key].label} selected={target === key} onPress={() => changeTrack({ examTarget: key }, onChanged)} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
