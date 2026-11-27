import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text_ } from './ui';
import { EXAMS, ExamTarget } from '../core/exam/types';
import { Segment, SEGMENT_KEYS, SEGMENTS, segmentOf } from '../core/segments';
import { localDateString } from '../core/streak';
import { repositories } from '../repositories';
import { useAppStore } from '../store/appStore';
import { MIN_TOUCH, radius, spacing, useTheme } from '../theme';
import { t } from '../i18n';

/**
 * Grubu değiştirir. Hiçbir ilerleme silinmez: her grubun kursu ayrı saklanır, geri dönünce kaldığı
 * yerden sürer. Bugünkü antrenman yalnızca hiç görev tamamlanmadıysa yeni gruba göre kurulur.
 */
function changeSegment(next: Segment, onChanged?: () => void) {
  const { level, updateSettings } = useAppStore.getState();
  updateSettings({ purpose: next });
  const repos = repositories();
  if (level) repos.course.ensure(level);
  repos.daily.reset(localDateString());
  onChanged?.();
}

/** Kullanıcı grubu seçimi: iki sütunlu kartlar; öğrenciler ayrıca hedef sınavını seçer. */
export function TrackSelector({ onChanged }: { onChanged?: () => void }) {
  const { colors } = useTheme();
  const segment = useAppStore((s) => segmentOf(s.settings.purpose));
  const target = useAppStore((s) => s.settings.examTarget);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const chooseExam = (key: ExamTarget) => {
    updateSettings({ examTarget: key });
    onChanged?.();
  };
  // İki sütun: satırlar eşit genişlikte kalır, tek başına kalan düğme olmaz.
  const grid = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, justifyContent: 'space-between' as const, rowGap: spacing.sm };
  const cell = { width: '48.5%' as const };

  return (
    <View style={{ gap: spacing.md }}>
      <Text_ variant="heading">{t('exam.trackTitle')}</Text_>
      <View accessibilityRole="radiogroup" style={grid}>
        {SEGMENT_KEYS.map((key) => {
          const info = SEGMENTS[key];
          const selected = segment === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${info.label}. ${info.audience}`}
              onPress={() => !selected && changeSegment(key, onChanged)}
              style={({ pressed }) => [cell, { minHeight: 108, gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg, borderWidth: 2, borderColor: selected ? colors.primary : 'transparent', backgroundColor: selected ? colors.primarySoft : colors.background, opacity: pressed ? 0.8 : 1 }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? colors.primary : colors.surface }}>
                  <Ionicons name={info.icon as any} size={20} color={selected ? colors.onPrimary : colors.primary} />
                </View>
                <Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={selected ? colors.primary : colors.border} />
              </View>
              <View style={{ gap: 2 }}>
                <Text_ variant="label" numberOfLines={1}>{info.label}</Text_>
                <Text_ variant="caption" muted numberOfLines={2}>{info.audience}</Text_>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text_ variant="caption" muted>{SEGMENTS[segment].need}</Text_>

      {segment === 'exam' ? (
        <View style={{ gap: spacing.sm, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }}>
          <Text_ variant="label">{t('exam.whichExam')}</Text_>
          <View accessibilityRole="radiogroup" style={[grid, { padding: spacing.xs, borderRadius: radius.lg, backgroundColor: colors.background }]}>
            {(Object.keys(EXAMS) as ExamTarget[]).map((key) => {
              const selected = target === key;
              return (
                <Pressable
                  key={key}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => chooseExam(key)}
                  style={({ pressed }) => [cell, { minHeight: MIN_TOUCH, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm, borderRadius: radius.md, backgroundColor: selected ? colors.primary : 'transparent', opacity: pressed ? 0.8 : 1 }]}
                >
                  <Text_ variant="label" numberOfLines={1} adjustsFontSizeToFit style={{ color: selected ? colors.onPrimary : colors.text }}>{EXAMS[key].label}</Text_>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}
