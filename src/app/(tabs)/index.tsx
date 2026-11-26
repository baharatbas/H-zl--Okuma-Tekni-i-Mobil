import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Text_ } from '../../components/ui';
import { PremiumBanner } from '../../components/Premium';
import { DailyTraining } from '../../components/DailyTraining';
import { repositories } from '../../repositories';
import type { DailyTaskRow } from '../../repositories';
import { useAppStore } from '../../store/appStore';
import { radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';
import { localDateString } from '../../core/streak';
import { greetingKey } from '../../core/greeting';
import { DailySetCard } from '../../components/ParagraphHub';
import { stats, Stats, weakestType } from '../../core/exam/practice';
import type { QuestionType } from '../../core/exam/types';
import { TECHNIQUES } from '../../content/exam/techniques';
import { useTrack } from '../../hooks/useTrack';

interface HomeData {
  plan: DailyTaskRow[];
  totalXp: number;
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

const weekday = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('tr-TR', { weekday: 'short' });

/**
 * Bugün sekmesi: selamlama, günlük antrenman ve hafta, okuma özeti ve kısa yollar.
 * Üst başlık çubuğu yoktur; Ayarlar sayfanın sonundadır.
 */
export default function TodayScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { segment, isExam, exam } = useTrack();
  const level = useAppStore((s) => s.level);
  const displayName = useAppStore((s) => s.settings.displayName);
  const [data, setData] = useState<HomeData | null>(null);

  const load = useCallback(() => {
    const repos = repositories();
    const today = localDateString();
    const series = repos.progress.getPerformanceSeries(60);
    const last = series[series.length - 1];
    const attempts = repos.paragraphs.list();
    setData({
      plan: repos.daily.getPlan(today, level ?? 'beginner', segment),
      totalXp: repos.daily.totalXp(),
      streak: repos.progress.getStreak(today).current,
      week: repos.progress.getRecentMinutes(today, 7),
      lastWpm: last ? Math.round(last.wpm) : null,
      lastComprehension: last?.comprehension ?? null,
      exercises: repos.progress.getSummary().exerciseSessions,
      paragraph: stats(attempts),
      weak: weakestType(attempts),
    });
  }, [level, segment]);

  useFocusEffect(load);

  const now = new Date();
  const greeting = t(`today.${greetingKey(now.getHours())}`);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xl }} showsVerticalScrollIndicator={false}>
        <PremiumBanner />

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

        {/* Bugünkü antrenman */}
        {data ? (
          <DailyTraining plan={data.plan} totalXp={data.totalXp}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.sm }}>
              {data.week.map((d, i) => {
                const active = d.minutes > 0;
                const isToday = i === data.week.length - 1;
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
          </DailyTraining>
        ) : null}

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
            <LinkRow icon="school-outline" color={GREEN} label={t('home.continueCourse')} onPress={() => router.push('/(tabs)/course')} />
            <LinkRow divider icon="game-controller-outline" color={PURPLE} label={t('tabs.exercises')} onPress={() => router.push('/(tabs)/exercises')} />
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
