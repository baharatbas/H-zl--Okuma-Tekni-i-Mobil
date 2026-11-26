import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Empty, Stepper, Text_ } from '../../components/ui';
import { ExerciseGame } from '../../components/exercises/games';
import { lessonRoute, lessonTitle } from '../../services/lessons';
import { DIFFICULTY_LEVELS, nextDifficulty, PASS_SCORE } from '../../core/course';
import { EXERCISES, isExerciseKey } from '../../core/exercises/registry';
import type { ExerciseResult, ExerciseSettings } from '../../core/exercises/types';
import { repositories } from '../../repositories';
import { recordActivity } from '../../services/activity';
import { haptic } from '../../services/haptics';
import { MIN_TOUCH, radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';

type Phase = 'setup' | 'play' | 'result';

/** Sonuca göre 1–3 yıldız. */
export function starRating(score: number): 1 | 2 | 3 {
  if (score >= 85) return 3;
  if (score >= 60) return 2;
  return 1;
}

/** Egzersiz: tanıtım → ayarlar → oyun → sonuç. Sade, tek vurgu rengi. */
export default function ExerciseScreen() {
  const { key, lesson } = useLocalSearchParams<{ key: string; lesson?: string }>();
  const { colors, scale } = useTheme();
  const exerciseKey = typeof key === 'string' && isExerciseKey(key) ? key : null;
  const meta = exerciseKey ? EXERCISES[exerciseKey] : null;

  const [phase, setPhase] = useState<Phase>('setup');
  // Kurstan gelindiyse adım okunur; geçilmemiş en kolay seviye seçili gelir.
  const findStep = () =>
    lesson === undefined ? undefined : repositories().course.getActive()?.lessons.find((l) => l.orderIndex === Number(lesson));
  const [passed, setPassed] = useState<number[]>(() => findStep()?.passedLevels ?? []);
  const [draft, setDraft] = useState<ExerciseSettings | null>(() => {
    if (!meta) return null;
    const step = findStep();
    return step ? { ...meta.defaults, difficulty: nextDifficulty(step.passedLevels) ?? step.difficulty } : { ...meta.defaults };
  });
  const [nextStep, setNextStep] = useState<{ title: string; route: string } | null>(null);
  const [settings, setSettings] = useState<ExerciseSettings | null>(null);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [gameKey, setGameKey] = useState(0);

  if (!exerciseKey || !meta || !draft) return <Empty text={t('errors.notFound')} />;
  const [minSpeed, maxSpeed] = meta.speedRange;
  const speedStep = Math.max(10, Math.round((maxSpeed - minSpeed) / 10));

  const handleFinish = (r: ExerciseResult) => {
    const s = settings ?? draft;
    setResult(r);
    setPhase('result');
    haptic('success');
    const repos = repositories();
    const step = findStep();
    repos.exercises.recordSession(exerciseKey, r, { speedMs: s.speedMs, difficulty: s.difficulty, courseLessonId: step?.id });
    recordActivity(r.durationMs);
    const course = lesson === undefined ? null : repos.course.getActive();
    if (course) {
      const updated = repos.course.completeExerciseIfPassed(course.id, Number(lesson));
      const current = updated.lessons.find((l) => l.orderIndex === Number(lesson));
      setPassed(current?.passedLevels ?? []);
      const next = current?.isCompleted ? updated.lessons.find((l) => !l.isCompleted && l.unlocked) : undefined;
      setNextStep(next ? { title: lessonTitle(next), route: lessonRoute(next) } : null);
    }
  };

  // Sonuçtan sıradaki geçilmemiş seviyeye geçer.
  const playLevel = (difficulty: number) => {
    const next = { ...draft, difficulty };
    setDraft(next);
    setSettings(next);
    setResult(null);
    setGameKey((k) => k + 1);
    setPhase('play');
  };

  const play = () => {
    setSettings(draft);
    setResult(null);
    setGameKey((k) => k + 1);
    setPhase('play');
  };

  const segment = (selected: boolean) => ({
    flex: 1,
    minHeight: MIN_TOUCH,
    borderRadius: radius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: selected ? colors.primary : colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: selected ? colors.primary : colors.border,
  });

  // Oyunlar tam ekran oynanır; üst başlık gizlenir.
  if (phase === 'play' && settings) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
        <ExerciseGame key={gameKey} exerciseKey={exerciseKey} settings={settings} onFinish={handleFinish} onQuit={() => setPhase('setup')} />
      </>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl }} style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: meta.name, headerShown: true, gestureEnabled: true }} />

      {phase === 'setup' && (
        <>
          <View style={{ gap: spacing.xs }}>
            <Text_ variant="title">{meta.name}</Text_>
            <Text_ muted>{meta.goal}</Text_>
          </View>

          <Card style={{ gap: spacing.md }}>
            <Text_ variant="label" muted>{t('exercises.howToTitle')}</Text_>
            {meta.howTo.map((step, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
                <Text_ variant="label" style={{ color: meta.color, width: 18 }}>{String(i + 1)}</Text_>
                <Text_ style={{ flex: 1 }}>{step}</Text_>
              </View>
            ))}
          </Card>

          <View style={{ flexDirection: 'row', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'flex-start' }}>
            <Ionicons name="bulb-outline" size={20} color={colors.primary} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text_ variant="label" style={{ color: colors.primary }}>{t('exercises.tipTitle')}</Text_>
              <Text_ variant="caption">{meta.tip}</Text_>
            </View>
          </View>

          <Card style={{ gap: spacing.lg }}>
            <View style={{ gap: spacing.sm }}>
              <Text_ variant="label" muted>{t('exercises.difficulty')}</Text_>
              {lesson !== undefined ? (
                <Text_ variant="caption" muted>{t('exercises.levelRule', { done: passed.length, total: DIFFICULTY_LEVELS.length, score: PASS_SCORE })}</Text_>
              ) : null}
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {[1, 2, 3, 4, 5].map((d) => (
                  <Pressable
                    key={d}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('exercises.difficulty')} ${d}${passed.includes(d) ? `, ${t('exercises.levelPassedA11y')}` : ''}`}
                    accessibilityState={{ selected: draft.difficulty === d }}
                    onPress={() => setDraft({ ...draft, difficulty: d })}
                    style={segment(draft.difficulty === d)}
                  >
                    <Text_ variant="label" style={{ color: draft.difficulty === d ? colors.onPrimary : colors.text }}>{String(d)}</Text_>
                    {passed.includes(d) ? <Ionicons name="checkmark-circle" size={14} color={draft.difficulty === d ? colors.onPrimary : colors.success} /> : null}
                  </Pressable>
                ))}
              </View>
            </View>

            {maxSpeed > 0 && lesson === undefined && (
              <Stepper
                label={meta.speedLabel}
                value={draft.speedMs}
                min={minSpeed}
                max={maxSpeed}
                step={speedStep}
                format={(v) => (v >= 5000 ? `${Math.round(v / 100) / 10} sn` : `${v} ms`)}
                onChange={(v) => setDraft({ ...draft, speedMs: v })}
              />
            )}

            {(exerciseKey === 'tracking' || exerciseKey === 'schulte') && (
              <View style={{ gap: spacing.sm }}>
                <Text_ variant="label" muted>{t('exercises.duration')}</Text_>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  {(exerciseKey === 'schulte' ? [60, 120, 180] : [30, 60, 90]).map((sec) => (
                    <Pressable
                      key={sec}
                      accessibilityRole="button"
                      accessibilityState={{ selected: draft.durationSec === sec }}
                      onPress={() => setDraft({ ...draft, durationSec: sec })}
                      style={segment(draft.durationSec === sec)}
                    >
                      <Text_ variant="label" style={{ color: draft.durationSec === sec ? colors.onPrimary : colors.text }}>{t('common.secondsShort', { count: sec })}</Text_>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </Card>

          <Button title={t('exercises.ready')} onPress={play} />
        </>
      )}

      {phase === 'result' && result && (
        <ResultView result={result} onRetry={play} onBack={() => router.back()} scale={scale} next={nextStep} fromCourse={lesson !== undefined}
          course={
            lesson === undefined || !settings
              ? null
              : { passed, level: settings.difficulty, ok: result.score >= PASS_SCORE, onPlayLevel: playLevel }
          } />
      )}
    </ScrollView>
  );
}

function ResultView({
  result,
  onRetry,
  onBack,
  scale,
  next,
  fromCourse,
  course,
}: {
  result: ExerciseResult;
  onRetry: () => void;
  onBack: () => void;
  scale: (n: number) => number;
  next: { title: string; route: string } | null;
  fromCourse: boolean;
  course: { passed: number[]; level: number; ok: boolean; onPlayLevel: (d: number) => void } | null;
}) {
  const { colors } = useTheme();
  const stars = starRating(result.score);
  const title = stars === 3 ? t('exercises.resultGreat') : stars === 2 ? t('exercises.resultGood') : t('exercises.resultKeep');

  return (
    <View style={{ gap: spacing.lg }}>
      <Card style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl }}>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {[1, 2, 3].map((n) => (
            <Animated.View key={n} entering={ZoomIn.delay(150 * n).duration(300)}>
              <Ionicons name={n <= stars ? 'star' : 'star-outline'} size={scale(36)} color={n <= stars ? colors.accentStar : colors.border} />
            </Animated.View>
          ))}
        </View>
        <Text_ variant="title" style={{ textAlign: 'center' }}>{title}</Text_>
        <Text_ style={{ fontSize: scale(44), lineHeight: scale(54), fontWeight: '700', color: colors.primary }}>{String(result.score)}</Text_>
        <Text_ variant="caption" muted>{t('exercises.score')}</Text_>
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Card style={{ flex: 1, alignItems: 'center', gap: 2 }}>
          <Text_ variant="heading">{`${Math.round(result.accuracy * 100)}%`}</Text_>
          <Text_ variant="caption" muted>{t('exercises.accuracy')}</Text_>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center', gap: 2 }}>
          <Text_ variant="heading">{result.avgResponseMs !== null ? `${Math.round(result.avgResponseMs)} ms` : '—'}</Text_>
          <Text_ variant="caption" muted>{t('exercises.avgResponse')}</Text_>
        </Card>
      </View>

      <Text_ variant="caption" muted style={{ textAlign: 'center' }}>{t('exercises.saved')}</Text_>
      {course ? (
        <Card style={{ gap: spacing.md }}>
          <Text_ variant="heading">
            {course.ok ? t('exercises.levelDone', { level: course.level }) : t('exercises.levelFailed', { level: course.level, score: PASS_SCORE })}
          </Text_>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {DIFFICULTY_LEVELS.map((d) => {
              const done = course.passed.includes(d);
              return (
                <View key={d} accessible accessibilityLabel={`${t('exercises.difficulty')} ${d}${done ? `, ${t('exercises.levelPassedA11y')}` : ''}`} style={{ flex: 1, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? colors.success : colors.surfaceAlt }}>
                  {done ? <Ionicons name="checkmark" size={20} color="#FFFFFF" /> : <Text_ variant="label" muted>{String(d)}</Text_>}
                </View>
              );
            })}
          </View>
          {nextDifficulty(course.passed) !== null ? (
            <Button title={t('exercises.playLevel', { level: nextDifficulty(course.passed)! })} onPress={() => course.onPlayLevel(nextDifficulty(course.passed)!)} />
          ) : (
            <Text_ muted>{t('exercises.allLevelsDone')}</Text_>
          )}
        </Card>
      ) : null}
      {next ? (
        <Button title={`${t('exercises.nextStep')}: ${next.title}`} onPress={() => router.replace(next.route as any)} />
      ) : null}
      <Button title={t('exercises.retry')} variant={next || course ? 'secondary' : 'primary'} onPress={onRetry} />
      <Button title={fromCourse ? t('common.close') : t('exercises.back')} variant="ghost" onPress={onBack} />
    </View>
  );
}
