import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
import { lessonRoute, lessonStepIcon, lessonTitle } from '../../services/lessons';
import { unitMeta } from '../../core/course';
import { haptic } from '../../services/haptics';
import { examRef, isTrackMismatch } from '../../core/exam/course';
import { useTrack } from '../../hooks/useTrack';
import { TECHNIQUES } from '../../content/exam/techniques';

/** Ünitelerin sırayla kullandığı sakin vurgu renkleri. */
const UNIT_COLORS = ['#2F7F86', '#3B75AE', '#76609E', '#B07A2A', '#3D8B5A'];

const typeLabel = (l: LessonRow) =>
  examRef(l.contentRef)
    ? t(examRef(l.contentRef)!.kind === 'tech' ? 'exam.stepTech' : 'exam.stepPractice')
    : l.type === 'exercise' ? t('course.stepExercise') : l.type === 'reading' ? t('course.stepReading') : t('course.stepTest');

/**
 * Kurs: ilerleme ve sıradaki adımı gösteren üst kart, ardından ünite kartları.
 * Üst başlık çubuğu yoktur.
 */
export default function CourseScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isExam } = useTrack();
  const level = useAppStore((s) => s.level);
  const [course, setCourse] = useState<CourseView | null>(null);

  useFocusEffect(
    useCallback(() => {
      setCourse(repositories().course.getActive());
    }, []),
  );

  const startFresh = () => {
    if (!level) return router.push('/level-test');
    setCourse(repositories().course.start(level));
  };

  const confirmRestart = () => {
    Alert.alert(t('course.restartTitle'), t('course.restartMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('course.restart'), style: 'destructive', onPress: startFresh },
    ]);
  };

  const open = (lesson: LessonRow) => {
    haptic('light');
    router.push(lessonRoute(lesson) as any);
  };

  const units = useMemo(() => {
    const map = new Map<number, LessonRow[]>();
    course?.lessons.forEach((l) => map.set(l.unit, [...(map.get(l.unit) ?? []), l]));
    return [...map.entries()];
  }, [course]);

  const page = { flex: 1, backgroundColor: colors.background, paddingTop: insets.top };

  if (!course) {
    return (
      <View style={page}>
        <View style={{ padding: spacing.lg, gap: spacing.lg }}>
          <Text_ variant="title" accessibilityRole="header">{t('course.title')}</Text_>
          <Card style={{ gap: spacing.md }}>
            <Text_ muted>{t('course.noCourse')}</Text_>
            <Button title={t('course.startNew')} onPress={startFresh} />
          </Card>
        </View>
      </View>
    );
  }

  const total = course.lessons.length;
  const done = course.lessons.filter((l) => l.isCompleted).length;
  const next = course.lessons.find((l) => !l.isCompleted && l.unlocked) ?? null;
  const ratio = total ? done / total : 0;

  return (
    <View style={page}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl }} showsVerticalScrollIndicator={false}>
        {/* Üst kart: ilerleme ve sıradaki adım */}
        <View style={{ borderRadius: radius.lg, backgroundColor: colors.primarySoft, padding: spacing.lg, gap: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
            <View style={{ flex: 1, minWidth: 0, gap: spacing.xs }}>
              <Text_ variant="caption" muted>{t('course.eyebrow')}</Text_>
              <Text_ variant="title" accessibilityRole="header">{course.title}</Text_>
              <Text_ variant="caption" muted>{t('course.progressLabel', { done, total })}</Text_>
            </View>
            <ProgressRing value={ratio} size={80} trackColor={colors.surface} label={`%${Math.round(ratio * 100)}`} />
          </View>

          {next ? (
            <View style={{ borderRadius: radius.md, backgroundColor: colors.surface, padding: spacing.md, gap: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={lessonStepIcon(next.type)} size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text_ variant="caption" muted>{t('course.nextUp')}</Text_>
                  <Text_ variant="heading">{lessonTitle(next)}</Text_>
                </View>
              </View>
              <Button title={done === 0 ? t('course.begin') : t('course.continueCta')} onPress={() => open(next)} />
            </View>
          ) : (
            <Text_ variant="heading">{t('home.courseDone')}</Text_>
          )}
        </View>

        {isTrackMismatch(course.lessons, isExam) ? (
          <Card style={{ gap: spacing.md }}>
            <Text_>{t('exam.mismatch')}</Text_>
            <Button title={t('exam.switchCourse')} variant="secondary" onPress={confirmRestart} />
          </Card>
        ) : null}

        {/* Ünite kartları */}
        {units.map(([unit, lessons], unitIndex) => {
          const examType = lessons.map((l) => examRef(l.contentRef)?.type).find(Boolean);
          const meta = examType ? { title: TECHNIQUES[examType].title, goal: TECHNIQUES[examType].goal } : unitMeta(course.level, unit);
          const tint = UNIT_COLORS[unitIndex % UNIT_COLORS.length];
          const unitDone = lessons.filter((l) => l.isCompleted).length;
          const complete = unitDone === lessons.length;
          return (
            <View key={unit} style={{ borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: tint + '14' }}>
                <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: tint, alignItems: 'center', justifyContent: 'center' }}>
                  {complete ? <Ionicons name="checkmark" size={22} color="#FFFFFF" /> : <Text_ variant="heading" style={{ color: '#FFFFFF' }}>{String(unit)}</Text_>}
                </View>
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <Text_ variant="heading">{meta.title}</Text_>
                  <Text_ variant="caption" muted>{meta.goal}</Text_>
                </View>
                <Text_ variant="label" muted>{`${unitDone}/${lessons.length}`}</Text_>
              </View>

              <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }}>
                {lessons.map((lesson, i) => {
                  const locked = !lesson.unlocked;
                  const current = next?.id === lesson.id;
                  const status = lesson.isCompleted ? t('course.doneBadge') : locked ? t('course.locked') : typeLabel(lesson);
                  const nodeBg = lesson.isCompleted ? colors.success : current ? tint : colors.surfaceAlt;
                  const nodeFg = lesson.isCompleted || current ? '#FFFFFF' : colors.textMuted;
                  return (
                    <Pressable
                      key={lesson.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${lessonTitle(lesson)}, ${status}`}
                      accessibilityState={{ disabled: locked }}
                      disabled={locked}
                      onPress={() => open(lesson)}
                      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 64, opacity: pressed ? 0.7 : 1 })}
                    >
                      <View style={{ width: 36, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }}>
                        {i > 0 && <View style={{ position: 'absolute', top: 0, height: '50%', width: 2, backgroundColor: colors.border }} />}
                        {i < lessons.length - 1 && <View style={{ position: 'absolute', bottom: 0, height: '50%', width: 2, backgroundColor: colors.border }} />}
                        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: nodeBg, alignItems: 'center', justifyContent: 'center' }}>
                          <Ionicons name={lesson.isCompleted ? 'checkmark' : locked ? 'lock-closed' : lessonStepIcon(lesson.type)} size={18} color={nodeFg} />
                        </View>
                      </View>
                      <View style={{ flex: 1, minWidth: 0, paddingVertical: spacing.sm }}>
                        <Text_ variant="label" numberOfLines={2} muted={locked}>{lessonTitle(lesson)}</Text_>
                        <Text_ variant="caption" muted>{status}</Text_>
                      </View>
                      {current ? (
                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: tint + '1F', alignItems: 'center', justifyContent: 'center' }}>
                          <Ionicons name="arrow-forward" size={18} color={tint} />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}

        <Text_ variant="caption" muted style={{ textAlign: 'center' }}>{t('course.lockedHint')}</Text_>
        <Button title={t('course.restart')} variant="ghost" onPress={confirmRestart} />
      </ScrollView>
    </View>
  );
}
