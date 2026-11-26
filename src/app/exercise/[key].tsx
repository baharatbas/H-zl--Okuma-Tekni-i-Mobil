import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Empty, Stepper, Text_ } from '../../components/ui';
import { ExerciseGame } from '../../components/exercises/games';
import { SchulteGame } from '../../components/exercises/SchulteGame';
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
  const [draft, setDraft] = useState<ExerciseSettings | null>(() => (meta ? { ...meta.defaults } : null));
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
    repositories().exercises.recordSession(exerciseKey, r, { speedMs: s.speedMs, difficulty: s.difficulty });
    recordActivity(r.durationMs);
    if (lesson !== undefined) {
      const repos = repositories();
      const course = repos.course.getActive();
      if (course) repos.course.completeLesson(course.id, Number(lesson));
    }
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

  // Schulte Tablosu tam ekran oynanır; üst başlık gizlenir.
  if (phase === 'play' && settings && exerciseKey === 'schulte') {
    return (
      <>
        <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
        <SchulteGame key={gameKey} settings={settings} onFinish={handleFinish} onQuit={() => setPhase('setup')} />
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
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {[1, 2, 3, 4, 5].map((d) => (
                  <Pressable
                    key={d}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('exercises.difficulty')} ${d}`}
                    accessibilityState={{ selected: draft.difficulty === d }}
                    onPress={() => setDraft({ ...draft, difficulty: d })}
                    style={segment(draft.difficulty === d)}
                  >
                    <Text_ variant="label" style={{ color: draft.difficulty === d ? colors.onPrimary : colors.text }}>{String(d)}</Text_>
                  </Pressable>
                ))}
              </View>
            </View>

            {maxSpeed > 0 && (
              <Stepper
                label={meta.speedLabel}
                value={draft.speedMs}
                min={minSpeed}
                max={maxSpeed}
                step={speedStep}
                format={(v) => `${v} ms`}
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

      {phase === 'play' && settings && (
        <>
          <ExerciseGame key={gameKey} exerciseKey={exerciseKey} settings={settings} onFinish={handleFinish} />
          <Button title={t('exercises.quit')} variant="ghost" onPress={() => setPhase('setup')} />
        </>
      )}

      {phase === 'result' && result && (
        <ResultView result={result} onRetry={play} onBack={() => router.back()} scale={scale} />
      )}
    </ScrollView>
  );
}

function ResultView({
  result,
  onRetry,
  onBack,
  scale,
}: {
  result: ExerciseResult;
  onRetry: () => void;
  onBack: () => void;
  scale: (n: number) => number;
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
        <Text_ style={{ fontSize: scale(44), fontWeight: '700', color: colors.primary }}>{String(result.score)}</Text_>
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
      <Button title={t('exercises.retry')} onPress={onRetry} />
      <Button title={t('exercises.back')} variant="secondary" onPress={onBack} />
    </View>
  );
}
