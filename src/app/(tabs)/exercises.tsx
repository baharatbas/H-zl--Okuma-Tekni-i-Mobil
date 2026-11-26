import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text_ } from '../../components/ui';
import { DailySetCard, TypeList } from '../../components/ParagraphHub';
import type { Attempt } from '../../core/exam/practice';
import { useTrack } from '../../hooks/useTrack';
import { EXERCISES, EXERCISE_KEYS } from '../../core/exercises/registry';
import type { ExerciseKey } from '../../core/exercises/types';
import { EXERCISE_GROUPS, SHORT_SKILL } from '../../content/exerciseGroups';
import { textOfTheDay as pickOfDay } from '../../content/textCategories';
import { localDateString } from '../../core/streak';
import { repositories } from '../../repositories';
import { radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';

/** Egzersizler: günün egzersizi ve konuya göre gruplanmış renkli kartlar. Üst başlık çubuğu yoktur. */
export default function ExercisesScreen() {
  const { colors, fontScale } = useTheme();
  const insets = useSafeAreaInsets();
  const { isExam } = useTrack();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const { width, fontScale: systemScale } = useWindowDimensions();
  const [best, setBest] = useState<Partial<Record<ExerciseKey, number>>>({});

  useFocusEffect(
    useCallback(() => {
      const map: Partial<Record<ExerciseKey, number>> = {};
      repositories()
        .exercises.listSessions(undefined, 500)
        .forEach((s) => {
          map[s.key] = Math.max(map[s.key] ?? 0, s.score);
        });
      setBest(map);
      setAttempts(repositories().paragraphs.list());
    }, []),
  );

  // Büyük yazı ayarında kartlar tek sütuna geçer.
  const single = fontScale * systemScale >= 1.3;
  const gap = spacing.md;
  const tileWidth = single ? width - spacing.lg * 2 : Math.floor((width - spacing.lg * 2 - gap) / 2);

  const dailyKey = pickOfDay(EXERCISE_KEYS, localDateString()) ?? EXERCISE_KEYS[0];
  const daily = EXERCISES[dailyKey];
  const open = (key: ExerciseKey) => router.push(`/exercise/${key}`);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xl }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: spacing.xs }}>
          <Text_ variant="title" accessibilityRole="header">{isExam ? t('exam.hubTitle') : t('exercises.title')}</Text_>
          <Text_ muted>{isExam ? t('exam.hubSubtitle') : t('exercises.shortSubtitle', { count: EXERCISE_KEYS.length })}</Text_>
        </View>

        {isExam ? (
          <>
            <DailySetCard />
            <View style={{ gap: spacing.md }}>
              <Text_ variant="heading" accessibilityRole="header">{t('exam.typesTitle')}</Text_>
              <TypeList attempts={attempts} />
            </View>
            <Text_ variant="title" accessibilityRole="header">{t('exam.eyeTitle')}</Text_>
          </>
        ) : null}

        {/* Günün egzersizi */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t('exercises.dailyTitle')}: ${daily.name}`}
          onPress={() => open(dailyKey)}
          style={({ pressed }) => ({ borderRadius: radius.lg, backgroundColor: daily.color + '1C', padding: spacing.lg, gap: spacing.md, opacity: pressed ? 0.85 : 1 })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
            <View style={{ flex: 1, minWidth: 0, gap: spacing.xs }}>
              <Text_ variant="label" style={{ color: daily.color }}>{t('exercises.dailyTitle')}</Text_>
              <Text_ variant="title">{daily.name}</Text_>
              <Text_ variant="caption" muted>{daily.goal}</Text_>
            </View>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={daily.icon as any} size={34} color={daily.color} />
            </View>
          </View>
          <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, height: 44, paddingHorizontal: spacing.xl, borderRadius: radius.pill, backgroundColor: colors.primary }}>
            <Ionicons name="play" size={16} color={colors.onPrimary} />
            <Text_ variant="label" style={{ color: colors.onPrimary }}>{t('exercises.play')}</Text_>
          </View>
        </Pressable>

        {EXERCISE_GROUPS.map((group) => (
          <View key={group.id} style={{ gap: spacing.md }}>
            <View>
              <Text_ variant="heading" accessibilityRole="header">{group.title}</Text_>
              <Text_ variant="caption" muted>{group.subtitle}</Text_>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
              {group.keys.map((key) => {
                const ex = EXERCISES[key];
                const score = best[key];
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityLabel={`${ex.name}, ${SHORT_SKILL[key]}${score !== undefined ? `, ${t('exercises.best', { value: score })}` : ''}`}
                    onPress={() => open(key)}
                    style={({ pressed }) => ({
                      width: tileWidth,
                      minHeight: 144,
                      borderRadius: radius.lg,
                      backgroundColor: colors.surface,
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: colors.border,
                      padding: spacing.md,
                      gap: spacing.md,
                      justifyContent: 'space-between',
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ width: 48, height: 48, borderRadius: radius.md, backgroundColor: ex.color + '1C', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name={ex.icon as any} size={24} color={ex.color} />
                      </View>
                      {score !== undefined ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: spacing.sm, height: 24, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt }}>
                          <Ionicons name="star" size={12} color={colors.accentStar} />
                          <Text_ variant="caption">{String(score)}</Text_>
                        </View>
                      ) : null}
                    </View>
                    <View style={{ gap: 2 }}>
                      <Text_ variant="label" numberOfLines={2}>{ex.name}</Text_>
                      <Text_ variant="caption" muted numberOfLines={1}>{SHORT_SKILL[key]}</Text_>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
