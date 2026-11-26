import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PremiumBanner } from '../../components/Premium';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text_ } from '../../components/ui';
import { LineChart } from '../../components/LineChart';
import { repositories } from '../../repositories';
import type { ProgressSummary, PerformancePoint, ExerciseSessionRecord } from '../../repositories';
import { MIN_TOUCH, radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';
import { EXERCISES } from '../../core/exercises/registry';
import { average, change, niceScale } from '../../core/progressStats';
import { effectiveWpm } from '../../core/metrics';
import { localDateString } from '../../core/streak';
import { TypeList } from '../../components/ParagraphHub';
import { Attempt, stats } from '../../core/exam/practice';
import { useTrack } from '../../hooks/useTrack';
import { useAppStore } from '../../store/appStore';
import { ProfileCard } from '../../components/ProfileCard';
import { TrackSelector } from '../../components/TrackSelector';

interface ProgressData {
  summary: ProgressSummary;
  series: PerformancePoint[];
  recent: ExerciseSessionRecord[];
  week: { date: string; minutes: number }[];
  attempts: Attempt[];
  streak: number;
  bestStreak: number;
}

type Metric = 'speed' | 'comprehension' | 'effective';

const shortDate = (iso: string) => new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
const weekday = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('tr-TR', { weekday: 'short' });

/** İlerleme: güncel durum, seçilebilir grafik, haftalık çalışma, toplamlar ve son egzersizler. */
export default function ProgressScreen() {
  const { colors, scale } = useTheme();
  const insets = useSafeAreaInsets();
  const { isExam, exam } = useTrack();
  const goalMinutes = useAppStore((st) => st.settings.dailyGoalMinutes);
  const [data, setData] = useState<ProgressData | null>(null);
  const [metric, setMetric] = useState<Metric>('speed');

  const load = useCallback(() => {
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
  }, []);

  useFocusEffect(load);

  if (!data) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  const speedPoints = data.series.map((p) => ({ value: Math.round(p.wpm), label: shortDate(p.at) }));
  const compPoints = data.series.map((p) => ({ value: Math.round(p.comprehension * 100), label: shortDate(p.at) }));
  const speeds = speedPoints.map((p) => p.value);
  const comps = compPoints.map((p) => p.value);
  const effectivePoints = data.series.map((p) => ({ value: Math.round(effectiveWpm(p.wpm, p.comprehension)), label: shortDate(p.at) }));
  const points = metric === 'speed' ? speedPoints : metric === 'comprehension' ? compPoints : effectivePoints;
  const values = metric === 'speed' ? speeds : metric === 'comprehension' ? comps : effectivePoints.map((p) => p.value);
  const chartScale = metric === 'comprehension' ? { min: 0, max: 100, ticks: [0, 50, 100] } : niceScale(values);
  const diff = change(values);
  const avg = average(values);
  const format = (v: number) => (metric === 'comprehension' ? `%${v}` : String(v));

  const weekTotal = Math.round(data.week.reduce((sum, d) => sum + d.minutes, 0));
  // Günlük hedef çizgisinin de grafiğe sığması için tavan en az hedef kadardır.
  const weekMax = Math.max(goalMinutes, 1, ...data.week.map((d) => d.minutes));
  const activeDays = data.week.filter((d) => d.minutes > 0).length;
  const { summary } = data;
  const lessonRatio = summary.totalLessons ? summary.completedLessons / summary.totalLessons : 0;
  const metricColor = metric === 'speed' ? colors.primary : colors.success;

  const surface = { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.surface };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xl }} showsVerticalScrollIndicator={false}>
        <PremiumBanner />

        <ProfileCard streak={data.streak} bestStreak={data.bestStreak} />

        {/* Genel bakış: dört sayı */}
        <Section title={t('progress.totalsTitle')}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
            <StatTile icon="book" color="#3B75AE" value={summary.wordsRead.toLocaleString('tr-TR')} label={t('progress.wordsRead')} />
            <StatTile icon="game-controller" color="#76609E" value={String(summary.exerciseSessions)} label={t('progress.exercises')} />
            <StatTile icon="school" color="#B07A2A" value={`${summary.completedLessons}/${summary.totalLessons}`} label={t('progress.lessons')} ratio={lessonRatio} />
            <StatTile icon="checkmark-done" color="#3D8B5A" value={String(summary.testsTaken)} label={t('progress.tests')} />
          </View>
        </Section>

        {/* Performans: sekme, büyük değer, grafik ve özet tek kartta */}
        <Section title={t('progress.chartTitle')} note={t('progress.source')}>
          <View style={[surface, { padding: spacing.lg, gap: spacing.lg }]}>
            <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, padding: 4 }}>
              {(['speed', 'comprehension', 'effective'] as const).map((m) => {
                const selected = metric === m;
                return (
                  <Pressable
                    key={m}
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    onPress={() => setMetric(m)}
                    style={{ flex: 1, minHeight: MIN_TOUCH - 8, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? colors.surface : 'transparent' }}
                  >
                    <Text_ variant="label" style={{ color: selected ? colors.text : colors.textMuted }}>
                      {m === 'speed' ? t('progress.tabSpeed') : m === 'comprehension' ? t('progress.tabComprehension') : t('measure.effective')}
                    </Text_>
                  </Pressable>
                );
              })}
            </View>

            {points.length === 0 ? (
              <View style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg }}>
                <Ionicons name="trending-up" size={36} color={colors.textMuted} />
                <Text_ muted style={{ textAlign: 'center' }}>{t('progress.empty')}</Text_>
                <Button title={t('progress.emptyCta')} onPress={() => router.push('/(tabs)/library')} />
              </View>
            ) : (
              <>
                <View style={{ gap: spacing.xs }}>
                  <Text_ variant="caption" muted>{metric === 'speed' ? t('progress.lastSpeed') : metric === 'comprehension' ? t('progress.lastComprehension') : t('measure.lastEffective')}</Text_>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm }}>
                    <Text_ style={{ fontSize: scale(44), lineHeight: scale(50), fontWeight: '800', fontVariant: ['tabular-nums'] }}>{format(values[values.length - 1])}</Text_>
                    {metric !== 'comprehension' ? <Text_ muted>{t('today.wpmUnit')}</Text_> : null}
                  </View>
                  {diff !== null ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, backgroundColor: (diff >= 0 ? colors.success : colors.danger) + '1A' }}>
                      <Ionicons name={diff >= 0 ? 'trending-up' : 'trending-down'} size={14} color={diff >= 0 ? colors.success : colors.danger} />
                      <Text_ variant="caption" style={{ color: diff >= 0 ? colors.success : colors.danger, fontWeight: '600', flexShrink: 1 }}>
                        {diff === 0
                          ? t('progress.same')
                          : metric !== 'comprehension'
                            ? diff > 0 ? t('progress.speedUp', { value: diff }) : t('progress.speedDown', { value: -diff })
                            : diff > 0 ? t('progress.compUp', { value: diff }) : t('progress.compDown', { value: -diff })}
                      </Text_>
                    </View>
                  ) : null}
                </View>

                <LineChart
                  points={points}
                  scale={chartScale}
                  color={metricColor}
                  accessibilityLabel={t('progress.chartA11y', { count: points.length, last: format(values[values.length - 1]) })}
                />

                {points.length < 2 ? (
                  <Text_ variant="caption" muted style={{ textAlign: 'center' }}>{t('progress.oneMore')}</Text_>
                ) : (
                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    <Fact label={t('progress.average')} value={format(avg ?? 0)} />
                    <Fact label={t('progress.best')} value={format(Math.max(...values))} />
                    <Fact label={t('progress.measurements')} value={String(points.length)} />
                  </View>
                )}
              </>
            )}
          </View>
        </Section>

        {isExam ? (
          <Section title={t('exam.progressTitle')} note={t('exam.progressSummary', { total: stats(data.attempts).total, correct: stats(data.attempts).correct, sec: stats(data.attempts).avgSec ?? 0, target: exam.targetSec })}>
            <TypeList attempts={data.attempts} />
          </Section>
        ) : null}

        {/* Haftalık çalışma süresi */}
        <Section title={t('progress.weekTitle')}>
          <View style={[surface, { padding: spacing.lg, gap: spacing.lg }]}>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Fact label={t('progress.weekMinutes')} value={String(weekTotal)} />
              <Fact label={t('progress.weekDays')} value={`${activeDays}/7`} />
              <Fact label={t('progress.weekGoal')} value={String(goalMinutes)} />
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {data.week.map((d, i) => {
                const reached = d.minutes >= goalMinutes;
                const isToday = i === data.week.length - 1;
                return (
                  <View key={d.date} accessible accessibilityLabel={`${weekday(d.date)}: ${Math.round(d.minutes)} dk`} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                    <Text_ variant="caption" muted>{d.minutes > 0 ? String(Math.round(d.minutes)) : ' '}</Text_>
                    <View style={{ height: 96, width: '100%', maxWidth: 28, justifyContent: 'flex-end', borderRadius: 8, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
                      <View style={{ height: d.minutes > 0 ? Math.max(8, (d.minutes / weekMax) * 96) : 0, borderRadius: 8, backgroundColor: reached ? colors.success : colors.primary }} />
                    </View>
                    <Text_ variant="caption" muted={!isToday} style={{ fontWeight: isToday ? '700' : '400' }}>{weekday(d.date)}</Text_>
                  </View>
                );
              })}
            </View>
          </View>
        </Section>

        {/* Son egzersizler */}
        <Section title={t('progress.recentExercises')}>
          {data.recent.length === 0 ? (
            <View style={[surface, { padding: spacing.lg, gap: spacing.md }]}>
              <Text_ muted>{t('progress.noExercises')}</Text_>
              <Button title={t('progress.goExercises')} variant="secondary" onPress={() => router.push('/(tabs)/exercises')} />
            </View>
          ) : (
            <View style={[surface, { paddingHorizontal: spacing.lg }]}>
              {data.recent.map((r, i) => {
                const ex = EXERCISES[r.key];
                return (
                  <View key={r.id} accessible style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderTopWidth: i > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: colors.border }}>
                    <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: ex.color + '1F', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={ex.icon as any} size={20} color={ex.color} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }}>
                        <Text_ variant="label" numberOfLines={1} style={{ flex: 1 }}>{ex.name}</Text_>
                        <Text_ variant="label">{t('progress.points', { value: r.score })}</Text_>
                      </View>
                      <Bar ratio={r.score / 100} color={ex.color} />
                      <Text_ variant="caption" muted>{shortDate(r.startedAt)}</Text_>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Section>

        <View style={[surface, { padding: spacing.lg }]}>
          <TrackSelector onChanged={load} />
        </View>
      </ScrollView>
    </View>
  );
}

/** Bölüm başlığı, isteğe bağlı açıklama ve içerik. */
function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ gap: 2 }}>
        <Text_ variant="heading" accessibilityRole="header">{title}</Text_>
        {note ? <Text_ variant="caption" muted>{note}</Text_> : null}
      </View>
      {children}
    </View>
  );
}

function Bar({ ratio, color }: { ratio: number; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
      <View style={{ width: `${Math.min(1, Math.max(0, ratio)) * 100}%`, height: '100%', borderRadius: 3, backgroundColor: color }} />
    </View>
  );
}

function StatTile({ icon, color, value, label, ratio }: { icon: 'book' | 'game-controller' | 'school' | 'checkmark-done'; color: string; value: string; label: string; ratio?: number }) {
  const { colors } = useTheme();
  return (
    <View accessible accessibilityLabel={`${label}: ${value}`} style={{ flexGrow: 1, flexBasis: '45%', borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.lg, gap: spacing.sm }}>
      <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: color + '1F', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text_ variant="title" style={{ fontVariant: ['tabular-nums'] }}>{value}</Text_>
      <Text_ variant="caption" muted>{label}</Text_>
      {ratio !== undefined ? <Bar ratio={ratio} color={color} /> : null}
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View accessible style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.background }}>
      <Text_ variant="heading">{value}</Text_>
      <Text_ variant="caption" muted>{label}</Text_>
    </View>
  );
}
