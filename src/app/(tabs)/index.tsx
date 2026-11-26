import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Text_ } from '../../components/ui';
import { ProgressRing } from '../../components/ProgressRing';
import { repositories } from '../../repositories';
import type { CourseView, LessonRow } from '../../repositories';
import { useAppStore } from '../../store/appStore';
import { radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';
import { lessonGoal, lessonRoute, lessonStepIcon, lessonTitle } from '../../services/lessons';
import { goalProgress, localDateString } from '../../core/streak';
import { greetingKey } from '../../core/greeting';
import { DailySetCard } from '../../components/ParagraphHub';
import { stats, Stats, weakestType } from '../../core/exam/practice';
import type { QuestionType } from '../../core/exam/types';
import { TECHNIQUES } from '../../content/exam/techniques';
import { useTrack } from '../../hooks/useTrack';

interface HomeData {
  course: CourseView | null;
  upcoming: LessonRow[];
  done: number;
  target: number;
  streak: number;
  week: { date: string; minutes: number }[];
  lastWpm: number | null;
  lastComprehension: number | null;
  exercises: number;
  paragraph: Stats;
  weak: QuestionType | null;
}

const WARM = '#B07A2A';
const GREEN = '#3D8B5A';
const BLUE = '#3B75AE';
const PURPLE = '#76609E';

/** Tahmini süre (dk) adım türüne göre. */
const minutesFor = (l: LessonRow) => (l.type === 'exercise' ? 2 : l.type === 'reading' ? 4 : 3);
const weekday = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('tr-TR', { weekday: 'short' });

/**
 * Bugün sekmesi: selamlama, günlük hedef ve hafta, sıradaki adım, okuma özeti ve kısa yollar.
 * Üst başlık çubuğu yoktur; Ayarlar sayfanın sonundadır.
 */
export default function TodayScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isExam, exam } = useTrack();
  const level = useAppStore((s) => s.level);
  const displayName = useAppStore((s) => s.settings.displayName);
  const targetMinutes = useAppStore((s) => s.settings.dailyGoalMinutes);
  const [data, setData] = useState<HomeData | null>(null);

  const load = useCallback(() => {
    const repos = repositories();
    const today = localDateString();
    const course = repos.course.getActive();
    const goal = repos.progress.getDailyGoal(today, targetMinutes);
    const series = repos.progress.getPerformanceSeries(60);
    const last = series[series.length - 1];
    const attempts = repos.paragraphs.list();
    setData({
      course,
      upcoming: course ? course.lessons.filter((l) => !l.isCompleted).slice(0, 3) : [],
      done: goal.completedMinutes,
      target: goal.targetMinutes,
      streak: repos.progress.getStreak(today).current,
      week: repos.progress.getRecentMinutes(today, 7),
      lastWpm: last ? Math.round(last.wpm) : null,
      lastComprehension: last?.comprehension ?? null,
      exercises: repos.progress.getSummary().exerciseSessions,
      paragraph: stats(attempts),
      weak: weakestType(attempts),
    });
  }, [targetMinutes]);

  useFocusEffect(load);

  const now = new Date();
  const greeting = t(`today.${greetingKey(now.getHours())}`);
  const done = data?.done ?? 0;
  const target = data?.target ?? targetMinutes;
  const progress = goalProgress(done, target);
  const next = data?.upcoming[0] ?? null;
  const later = data?.upcoming.slice(1) ?? [];

  const startCourse = () => {
    if (!level) return router.push('/level-test');
    repositories().course.start(level);
    load();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xl }} showsVerticalScrollIndicator={false}>
        {/* Selamlama */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text_ variant="caption" muted>{now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}</Text_>
            <Text_ variant="title" accessibilityRole="header">{displayName ? `${greeting}, ${displayName}` : greeting}</Text_>
          </View>
          <View accessible accessibilityLabel={`${t('today.streak')}: ${data?.streak ?? 0}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, height: 40, borderRadius: radius.pill, backgroundColor: WARM + '1F' }}>
            <Ionicons name="flame" size={18} color={WARM} />
            <Text_ variant="heading">{String(data?.streak ?? 0)}</Text_>
          </View>
        </View>

        {/* Günlük hedef ve hafta */}
        <View style={{ borderRadius: radius.lg, backgroundColor: colors.primarySoft, padding: spacing.lg, gap: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
            <ProgressRing value={progress} size={92} trackColor={colors.surface} label={`%${Math.round(progress * 100)}`} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text_ variant="caption" muted>{t('home.dailyGoal')}</Text_>
              <Text_ variant="heading">
                {progress >= 1 ? t('home.goalReached') : t('home.goalRemaining', { minutes: Math.max(0, Math.ceil(target - done)) })}
              </Text_>
              <Text_ variant="caption" muted>{t('home.goalProgress', { done: Math.round(done), target })}</Text_>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {(data?.week ?? []).map((d, i) => {
              const active = d.minutes > 0;
              const isToday = i === (data?.week.length ?? 0) - 1;
              return (
                <View key={d.date} accessible accessibilityLabel={`${weekday(d.date)}: ${active ? t('today.studied') : t('today.notStudied')}`} style={{ alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.primary : colors.surface, borderWidth: isToday && !active ? 2 : 0, borderColor: colors.primary }}>
                    {active ? <Ionicons name="checkmark" size={18} color={colors.onPrimary} /> : null}
                  </View>
                  <Text_ variant="caption" muted style={{ fontWeight: isToday ? '700' : '400' }}>{weekday(d.date)}</Text_>
                </View>
              );
            })}
          </View>
        </View>

        {isExam ? (
          <View style={{ gap: spacing.md }}>
            <DailySetCard />
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <Stat color={GREEN} icon="checkmark-circle-outline" value={data?.paragraph.total ? `%${Math.round(data.paragraph.accuracy * 100)}` : '—'} label={t('exam.accuracy')} />
              <Stat color={BLUE} icon="timer-outline" value={data?.paragraph.avgSec != null ? `${data.paragraph.avgSec} sn` : '—'} label={t('exam.perQuestion', { sec: exam.targetSec })} />
            </View>
            {data?.weak ? (
              <Card style={{ gap: spacing.md }}>
                <Text_>{t('exam.weakHint', { type: TECHNIQUES[data.weak].title })}</Text_>
                <Button title={t('exam.reviewTechnique')} variant="secondary" onPress={() => router.push(`/paragraph/technique/${data.weak}`)} />
              </Card>
            ) : null}
          </View>
        ) : null}

        {/* Sıradaki adım */}
        <View style={{ gap: spacing.md }}>
          <Text_ variant="heading">{t('today.programTitle')}</Text_>
          {!data?.course ? (
            <Card style={{ gap: spacing.md }}>
              <Text_ muted>{t('course.noCourse')}</Text_>
              <Button title={level ? t('home.startCourse') : t('home.noLevelTitle')} onPress={startCourse} />
            </Card>
          ) : !next ? (
            <Card style={{ gap: spacing.md }}>
              <Text_ variant="heading">{t('home.courseDone')}</Text_>
              <Button title={t('tabs.library')} onPress={() => router.push('/(tabs)/library')} />
            </Card>
          ) : (
            <Card style={{ gap: spacing.lg }}>
              <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
                <View style={{ width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={lessonStepIcon(next.type)} size={26} color={colors.primary} />
                </View>
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <Text_ variant="heading">{lessonTitle(next)}</Text_>
                  <Text_ variant="caption" muted>{t('today.minutes', { count: minutesFor(next) })}</Text_>
                </View>
              </View>
              {lessonGoal(next) ? <Text_ muted>{lessonGoal(next)}</Text_> : null}
              <Button title={t('home.continueCourse')} onPress={() => router.push(lessonRoute(next) as any)} />
              {later.length > 0 ? (
                <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: spacing.md, gap: spacing.md }}>
                  <Text_ variant="caption" muted>{t('today.later')}</Text_>
                  {later.map((l) => (
                    <View key={l.id} accessible style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                      <Ionicons name={lessonStepIcon(l.type)} size={20} color={colors.textMuted} />
                      <Text_ style={{ flex: 1 }} muted numberOfLines={1}>{lessonTitle(l)}</Text_>
                      <Text_ variant="caption" muted>{t('today.minutes', { count: minutesFor(l) })}</Text_>
                    </View>
                  ))}
                </View>
              ) : null}
            </Card>
          )}
        </View>

        {/* Okuma özeti */}
        <View style={{ gap: spacing.md }}>
          <Text_ variant="heading">{t('today.summaryTitle')}</Text_>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Stat color={BLUE} icon="speedometer-outline" value={data?.lastWpm != null ? String(data.lastWpm) : '—'} label={t('today.wpmUnit')} />
            <Stat color={GREEN} icon="checkmark-circle-outline" value={data?.lastComprehension != null ? `%${Math.round(data.lastComprehension * 100)}` : '—'} label={t('today.comprehensionShort')} />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Stat color={PURPLE} icon="trending-up-outline" value={level ? t(`levels.${level}`) : '—'} label={t('today.level')} />
            <Stat color={WARM} icon="game-controller-outline" value={String(data?.exercises ?? 0)} label={t('today.exercises')} />
          </View>
        </View>

        {/* Kısa yollar */}
        <View style={{ gap: spacing.md }}>
          <Text_ variant="heading">{t('today.shortcuts')}</Text_>
          <View style={{ borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, overflow: 'hidden' }}>
            <LinkRow icon="game-controller-outline" color={PURPLE} label={t('tabs.exercises')} onPress={() => router.push('/(tabs)/exercises')} />
            <LinkRow icon="book-outline" color={BLUE} label={t('home.quickRead')} onPress={() => router.push('/(tabs)/library')} divider />
            <LinkRow icon="refresh-outline" color={GREEN} label={t('home.retakeLevel')} onPress={() => router.push('/level-test')} divider />
            <LinkRow icon="settings-outline" color={colors.textMuted} label={t('home.settings')} onPress={() => router.push('/settings')} divider />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <View accessible accessibilityLabel={`${label}: ${value}`} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, backgroundColor: color + '17' }}>
      <Ionicons name={icon as any} size={24} color={color} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text_ variant="heading" numberOfLines={1} adjustsFontSizeToFit>{value}</Text_>
        <Text_ variant="caption" muted numberOfLines={1}>{label}</Text_>
      </View>
    </View>
  );
}

function LinkRow({ icon, color, label, onPress, divider }: { icon: string; color: string; label: string; onPress: () => void; divider?: boolean }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 56, paddingHorizontal: spacing.lg, borderTopWidth: divider ? StyleSheet.hairlineWidth : 0, borderTopColor: colors.border, backgroundColor: pressed ? colors.surfaceAlt : 'transparent' })}
    >
      <Ionicons name={icon as any} size={22} color={color} />
      <Text_ style={{ flex: 1 }}>{label}</Text_>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}
