import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Text_ } from '../../components/ui';
import { LineChart } from '../../components/LineChart';
import { repositories } from '../../repositories';
import type { ProgressSummary, PerformancePoint, ExerciseSessionRecord } from '../../repositories';
import { MIN_TOUCH, radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';
import { EXERCISES } from '../../core/exercises/registry';
import { average, change, niceScale } from '../../core/progressStats';
import { localDateString } from '../../core/streak';
import { TypeList } from '../../components/ParagraphHub';
import { Attempt, stats } from '../../core/exam/practice';
import { useTrack } from '../../hooks/useTrack';
import { ProfileCard } from '../../components/ProfileCard';

interface ProgressData {
  summary: ProgressSummary;
  series: PerformancePoint[];
  recent: ExerciseSessionRecord[];
  week: { date: string; minutes: number }[];
  attempts: Attempt[];
  streak: number;
  bestStreak: number;
}

type Metric = 'speed' | 'comprehension';

const shortDate = (iso: string) => new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
const weekday = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('tr-TR', { weekday: 'short' });

/** İlerleme: güncel durum, seçilebilir grafik, haftalık çalışma, toplamlar ve son egzersizler. */
export default function ProgressScreen() {
  const { colors, scale } = useTheme();
  const insets = useSafeAreaInsets();
  const { isExam, exam } = useTrack();
  const [data, setData] = useState<ProgressData | null>(null);
  const [metric, setMetric] = useState<Metric>('speed');

  useFocusEffect(
    useCallback(() => {
      const repos = repositories();
      setData({
        summary: repos.progress.getSummary(),
        series: repos.progress.getPerformanceSeries(30),
        recent: repos.exercises.listSessions(undefined, 5),
        week: repos.progress.getRecentMinutes(localDateString(), 7),
        attempts: repos.paragraphs.list(),
        streak: repos.progress.getStreak(localDateString()).current,
        bestStreak: repos.progress.getStreak(localDateString()).state.bestStreak,
      });
    }, []),
  );

  if (!data) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  const speedPoints = data.series.map((p) => ({ value: Math.round(p.wpm), label: shortDate(p.at) }));
  const compPoints = data.series.map((p) => ({ value: Math.round(p.comprehension * 100), label: shortDate(p.at) }));
  const speeds = speedPoints.map((p) => p.value);
  const comps = compPoints.map((p) => p.value);
  const points = metric === 'speed' ? speedPoints : compPoints;
  const values = metric === 'speed' ? speeds : comps;
  const chartScale = metric === 'speed' ? niceScale(speeds) : { min: 0, max: 100, ticks: [0, 50, 100] };
  const diff = change(values);
  const avg = average(values);
  const format = (v: number) => (metric === 'speed' ? String(v) : `%${v}`);

  const weekTotal = Math.round(data.week.reduce((sum, d) => sum + d.minutes, 0));
  const weekMax = Math.max(1, ...data.week.map((d) => d.minutes));
  const activeDays = data.week.filter((d) => d.minutes > 0).length;

  const totals = [
    { icon: 'text-outline', label: t('progress.wordsRead'), value: data.summary.wordsRead.toLocaleString('tr-TR') },
    { icon: 'game-controller-outline', label: t('progress.exercises'), value: String(data.summary.exerciseSessions) },
    { icon: 'school-outline', label: t('progress.lessons'), value: `${data.summary.completedLessons} / ${data.summary.totalLessons}` },
    { icon: 'checkmark-done-outline', label: t('progress.tests'), value: String(data.summary.testsTaken) },
  ];

  const group = {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden' as const,
  };
  const divider = { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xl }}>
        <ProfileCard streak={data.streak} bestStreak={data.bestStreak} />

      <Text_ variant="title" accessibilityRole="header">{t('progress.title')}</Text_>

        {/* Performans: sekme, büyük değer, özet ve grafik tek kartta */}
        <Card style={{ gap: spacing.lg }}>
          <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 3 }}>
            {(['speed', 'comprehension'] as const).map((m) => {
              const selected = metric === m;
              return (
                <Pressable
                  key={m}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  onPress={() => setMetric(m)}
                  style={{ flex: 1, minHeight: MIN_TOUCH - 8, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? colors.surface : 'transparent' }}
                >
                  <Text_ variant="label" style={{ color: selected ? colors.text : colors.textMuted }}>
                    {m === 'speed' ? t('progress.tabSpeed') : t('progress.tabComprehension')}
                  </Text_>
                </Pressable>
              );
            })}
          </View>

          {points.length === 0 ? (
            <View style={{ gap: spacing.md }}>
              <Text_ muted>{t('progress.empty')}</Text_>
              <Button title={t('progress.emptyCta')} onPress={() => router.push('/(tabs)/library')} />
            </View>
          ) : (
            <>
              <View style={{ gap: 2 }}>
                <Text_ variant="caption" muted>{metric === 'speed' ? t('progress.lastSpeed') : t('progress.lastComprehension')}</Text_>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm }}>
                  <Text_ style={{ fontSize: scale(40), lineHeight: scale(46), fontWeight: '700' }}>{format(values[values.length - 1])}</Text_>
                  {metric === 'speed' ? <Text_ muted>{t('today.wpmUnit')}</Text_> : null}
                </View>
                {diff !== null ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <Ionicons name={diff >= 0 ? 'arrow-up' : 'arrow-down'} size={14} color={diff >= 0 ? colors.success : colors.danger} />
                    <Text_ variant="label" style={{ color: diff >= 0 ? colors.success : colors.danger }}>
                      {diff === 0
                        ? t('progress.same')
                        : metric === 'speed'
                          ? diff > 0 ? t('progress.speedUp', { value: diff }) : t('progress.speedDown', { value: -diff })
                          : diff > 0 ? t('progress.compUp', { value: diff }) : t('progress.compDown', { value: -diff })}
                    </Text_>
                  </View>
                ) : null}
              </View>

              <LineChart
                points={points}
                scale={chartScale}
                color={metric === 'speed' ? colors.primary : colors.success}
                accessibilityLabel={t('progress.chartA11y', { count: points.length, last: format(values[values.length - 1]) })}
              />

              {points.length < 2 ? (
                <Text_ variant="caption" muted style={{ textAlign: 'center' }}>{t('progress.oneMore')}</Text_>
              ) : (
                <View style={{ flexDirection: 'row', ...divider, paddingTop: spacing.md }}>
                  <Fact label={t('progress.average')} value={format(avg ?? 0)} />
                  <Fact label={t('progress.best')} value={format(Math.max(...values))} />
                  <Fact label={t('progress.measurements')} value={String(points.length)} />
                </View>
              )}
            </>
          )}
        </Card>

        <Text_ variant="caption" muted style={{ textAlign: 'center', marginTop: -spacing.md }}>{t('progress.source')}</Text_>

      {isExam ? (
        <View style={{ gap: spacing.sm }}>
          <Text_ variant="heading">{t('exam.progressTitle')}</Text_>
          <Text_ variant="caption" muted>
            {t('exam.progressSummary', { total: stats(data.attempts).total, correct: stats(data.attempts).correct, sec: stats(data.attempts).avgSec ?? 0, target: exam.targetSec })}
          </Text_>
          <TypeList attempts={data.attempts} />
        </View>
      ) : null}

      {/* Haftalık çalışma süresi */}
        <View style={{ gap: spacing.sm }}>
          <Text_ variant="heading">{t('progress.weekTitle')}</Text_>
          <Card style={{ gap: spacing.lg }}>
            <Text_ muted>{t('progress.weekSummary', { minutes: weekTotal, days: activeDays })}</Text_>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm }}>
              {data.week.map((d) => (
                <View key={d.date} accessible accessibilityLabel={`${weekday(d.date)}: ${Math.round(d.minutes)} dk`} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                  <View style={{ height: 72, width: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <View style={{ width: 20, borderRadius: 4, height: d.minutes > 0 ? Math.max(8, (d.minutes / weekMax) * 72) : 4, backgroundColor: d.minutes > 0 ? colors.primary : colors.surfaceAlt }} />
                  </View>
                  <Text_ variant="caption" muted>{weekday(d.date)}</Text_>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Toplamlar */}
        <View style={{ gap: spacing.sm }}>
          <Text_ variant="heading">{t('progress.totalsTitle')}</Text_>
          <View style={group}>
            {totals.map((row, i) => (
              <View key={row.label} accessible style={[{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 56, paddingHorizontal: spacing.lg }, i > 0 && divider]}>
                <Ionicons name={row.icon as any} size={20} color={colors.primary} />
                <Text_ style={{ flex: 1 }}>{row.label}</Text_>
                <Text_ variant="heading">{row.value}</Text_>
              </View>
            ))}
          </View>
        </View>

        {/* Son egzersizler */}
        <View style={{ gap: spacing.sm }}>
          <Text_ variant="heading">{t('progress.recentExercises')}</Text_>
          {data.recent.length === 0 ? (
            <Card style={{ gap: spacing.md }}>
              <Text_ muted>{t('progress.noExercises')}</Text_>
              <Button title={t('progress.goExercises')} variant="secondary" onPress={() => router.push('/(tabs)/exercises')} />
            </Card>
          ) : (
            <View style={group}>
              {data.recent.map((r, i) => {
                const ex = EXERCISES[r.key];
                return (
                  <View key={r.id} accessible style={[{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, paddingHorizontal: spacing.lg }, i > 0 && divider]}>
                    <View style={{ width: 36, height: 36, borderRadius: radius.sm, backgroundColor: ex.color + '18', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={ex.icon as any} size={18} color={ex.color} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text_ variant="label" numberOfLines={1}>{ex.name}</Text_>
                      <Text_ variant="caption" muted>{shortDate(r.startedAt)}</Text_>
                    </View>
                    <Text_ variant="heading">{t('progress.points', { value: r.score })}</Text_>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View accessible style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text_ variant="heading">{value}</Text_>
      <Text_ variant="caption" muted>{label}</Text_>
    </View>
  );
}
