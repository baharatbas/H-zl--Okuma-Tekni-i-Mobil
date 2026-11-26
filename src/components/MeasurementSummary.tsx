import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text_ } from './ui';
import { COMPREHENSION_TARGET, MeasurementFlag } from '../core/assessment';
import { effectiveWpm } from '../core/metrics';
import { SEGMENTS, segmentOf } from '../core/segments';
import { useAppStore } from '../store/appStore';
import { radius, spacing, useTheme } from '../theme';
import { t } from '../i18n';

/**
 * Ölçüm sonucu: hız tek başına başarı sayılmaz; anlama ve etkin hız birlikte gösterilir.
 * Öne çıkan gösterge çalışma yoluna göre değişir (sınav: anlama, kişisel gelişim: etkin hız).
 */
export function MeasurementSummary({ wpm, comprehension, correct, total, flags = [], costWarning = false }: { wpm: number; comprehension: number; correct: number; total: number; flags?: MeasurementFlag[]; costWarning?: boolean }) {
  const { colors } = useTheme();
  const focusComprehension = useAppStore((s) => SEGMENTS[segmentOf(s.settings.purpose)].focus) === 'comprehension';
  const effective = Math.round(effectiveWpm(wpm, comprehension));
  const percent = Math.round(comprehension * 100);

  const verdict = comprehension >= COMPREHENSION_TARGET ? 'verdictGood' : comprehension >= 0.6 ? 'verdictMid' : 'verdictLow';
  const metrics = [
    { label: t('measure.speed'), value: String(Math.round(wpm)), unit: t('today.wpmUnit'), main: false },
    { label: t('measure.comprehension'), value: `%${percent}`, unit: t('measure.correct', { correct, total }), main: focusComprehension },
    { label: t('measure.effective'), value: String(effective), unit: t('measure.effectiveUnit'), main: !focusComprehension },
  ];

  const notice = (text: string, key: string) => (
    <View key={key} style={{ flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.warning + '1A' }}>
      <Ionicons name="alert-circle-outline" size={20} color={colors.warning} />
      <Text_ variant="caption" style={{ flex: 1 }}>{text}</Text_>
    </View>
  );

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {metrics.map((m) => (
          <View key={m.label} accessible style={{ flex: 1, alignItems: 'center', gap: 2, padding: spacing.md, borderRadius: radius.lg, backgroundColor: m.main ? colors.primarySoft : colors.surface, borderWidth: m.main ? 2 : 1, borderColor: m.main ? colors.primary : colors.border }}>
            <Text_ variant="title">{m.value}</Text_>
            <Text_ variant="label" style={{ textAlign: 'center' }}>{m.label}</Text_>
            <Text_ variant="caption" muted style={{ textAlign: 'center' }}>{m.unit}</Text_>
          </View>
        ))}
      </View>
      <Card style={{ gap: spacing.xs }}>
        <Text_>{t(`measure.${verdict}`)}</Text_>
        <Text_ variant="caption" muted>{t(focusComprehension ? 'measure.goalExam' : 'measure.goalSelf')}</Text_>
      </Card>
      {costWarning ? notice(t('measure.cost'), 'cost') : null}
      {flags.map((f) => notice(t(`measure.flag_${f}`), f))}
      {flags.length > 0 ? <Text_ variant="caption" muted>{t('measure.excluded')}</Text_> : null}
    </View>
  );
}
