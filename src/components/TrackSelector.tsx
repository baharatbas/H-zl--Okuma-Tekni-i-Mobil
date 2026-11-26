import React from 'react';
import { Alert, View } from 'react-native';
import { Chip, Text_ } from './ui';
import { EXAMS, ExamTarget } from '../core/exam/types';
import { Segment, SEGMENT_KEYS, SEGMENTS, segmentOf } from '../core/segments';
import { localDateString } from '../core/streak';
import { repositories } from '../repositories';
import { useAppStore } from '../store/appStore';
import { spacing } from '../theme';
import { t } from '../i18n';

/** Grubu değiştirir; onaydan sonra yeni kurs ve (başlanmadıysa) yeni günlük antrenman oluşturulur. */
function changeSegment(next: Segment, onChanged?: () => void) {
  const { level, updateSettings } = useAppStore.getState();
  const apply = () => {
    updateSettings({ purpose: next });
    const repos = repositories();
    if (level) repos.course.start(level);
    repos.daily.reset(localDateString());
    onChanged?.();
  };
  if (!level) return apply();
  Alert.alert(t('exam.switchTitle'), t('exam.switchMessage'), [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('exam.switchConfirm'), onPress: apply },
  ]);
}

/** Kullanıcı grubu seçimi; öğrenciler ayrıca hedef sınavını seçer. */
export function TrackSelector({ onChanged }: { onChanged?: () => void }) {
  const segment = useAppStore((s) => segmentOf(s.settings.purpose));
  const target = useAppStore((s) => s.settings.examTarget);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const row = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: spacing.sm };
  const chooseExam = (key: ExamTarget) => {
    updateSettings({ examTarget: key });
    onChanged?.();
  };
  return (
    <View style={{ gap: spacing.md }}>
      <Text_ variant="heading">{t('exam.trackTitle')}</Text_>
      <View style={row}>
        {SEGMENT_KEYS.map((key) => (
          <Chip key={key} label={SEGMENTS[key].label} selected={segment === key} onPress={() => segment !== key && changeSegment(key, onChanged)} />
        ))}
      </View>
      <Text_ variant="caption" muted>{SEGMENTS[segment].need}</Text_>
      {segment === 'exam' ? (
        <View style={row}>
          {(Object.keys(EXAMS) as ExamTarget[]).map((key) => (
            <Chip key={key} label={EXAMS[key].label} selected={target === key} onPress={() => chooseExam(key)} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
