import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Text_ } from '../ui';
import { Feedback, ReadyPanel, RoundHud, Stage } from './shared';
import { radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';
import { createRng } from '../../core/rng';
import type { ExerciseKey, ExerciseResult, ExerciseSettings } from '../../core/exercises/types';
import { EXERCISES } from '../../core/exercises/registry';
import { STAR_COLORS, starHunterParams, generateStarRound, summarizeStarHunter, StarAnswer } from '../../core/exercises/starHunter';
import { flashParams, generateFlashRound, summarizeFlash, checkFlashAnswer } from '../../core/exercises/flashNumbers';
import { peripheralParams, generatePeripheralRound, summarizePeripheral, checkPeripheralAnswer } from '../../core/exercises/peripheral';
import { trackingParams, generateTargetWindows, trackingPosition, scoreTracking } from '../../core/exercises/tracking';
import { zigzagParams, generateZigzagSteps, summarizeZigzag } from '../../core/exercises/zigzag';
import { WordBlocksGame, ScanSearchGame, SkimGame } from './games2';
import { SynonymGame, LineScanGame, RsvpGame } from './games3';
import { SchulteGame } from './SchulteGame';

interface GameProps {
  settings: ExerciseSettings;
  onFinish: (result: ExerciseResult) => void;
}

/** Geri bildirim görünümü ve bir sonraki tura geçiş süresi (ms). */
const FEEDBACK_MS = 850;
const seed = () => (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;

function useStageSize(): number {
  const { width } = useWindowDimensions();
  return Math.min(width - spacing.lg * 2, 340);
}

function Note({ color }: { color: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="information-circle-outline" size={16} color={color} />
      <Text_ variant="caption" muted style={{ color: colors.textMuted, textAlign: 'center', flexShrink: 1 }}>
        {t('exercises.gameNote')}
      </Text_>
    </View>
  );
}

/* ───────────────────────── Yıldız Avcısı ───────────────────────── */
export function StarHunterGame({ settings, onFinish }: GameProps) {
  const { colors, reducedMotion, scale } = useTheme();
  const color = EXERCISES.star_hunter.color;
  const size = useStageSize();
  const params = useMemo(() => starHunterParams(settings.difficulty, settings.speedMs), [settings.difficulty, settings.speedMs]);
  const rounds = useMemo(() => {
    const rng = createRng(seed());
    return Array.from({ length: params.rounds }, (_, i) => generateStarRound(params, i, rng));
  }, [params]);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'show' | 'answer'>('ready');
  const [guess, setGuess] = useState(0);
  const [fb, setFb] = useState<{ ok: boolean; id: number } | null>(null);
  const answers = useRef<(StarAnswer | null)[]>([]);
  const startedAt = useRef(0);
  const answerStart = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const round = rounds[index];
  const targetHex = STAR_COLORS.find((c) => c.key === round.targetColor)?.hex ?? colors.primary;
  const targetName = STAR_COLORS.find((c) => c.key === round.targetColor)?.name ?? '';

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (phase !== 'show') return;
    const id = setTimeout(() => {
      answerStart.current = Date.now();
      setPhase('answer');
    }, round.displayMs);
    return () => clearTimeout(id);
  }, [phase, round]);

  const submit = () => {
    const ok = guess === round.targetCount;
    answers.current.push({ guess, responseMs: Date.now() - answerStart.current });
    setFb({ ok, id: index });
    const last = index + 1 >= rounds.length;
    timer.current = setTimeout(() => {
      setFb(null);
      setGuess(0);
      if (last) {
        const s = summarizeStarHunter(rounds, answers.current);
        onFinish({ score: s.score, accuracy: s.accuracy, avgResponseMs: s.avgResponseMs, durationMs: Date.now() - startedAt.current });
      } else {
        setIndex(index + 1);
        setPhase('ready');
      }
    }, FEEDBACK_MS);
  };

  return (
    <View style={{ gap: spacing.lg }}>
      <RoundHud done={index} total={rounds.length} color={color} label={t('exercises.round', { current: index + 1, total: rounds.length })} />

      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt }}>
          <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: targetHex }} />
          <Text_ variant="label">{`${t('exercises.tapTarget')}: ${targetName}`}</Text_>
        </View>
      </View>

      <Stage size={size} color={color} label={t('exercises.starHint')}>
        {phase === 'show' && (
          <Animated.View key={`round-${index}`} entering={reducedMotion ? undefined : FadeIn.duration(140)} style={StyleSheet.absoluteFill}>
            {round.stars.map((star, i) => (
              <View
                key={i}
                style={{ position: 'absolute', left: star.x * size - 18, top: star.y * size - 18 }}
              >
                <Ionicons name="star" size={scale(36)} color={STAR_COLORS.find((c) => c.key === star.color)?.hex} />
              </View>
            ))}
          </Animated.View>
        )}
        {phase === 'ready' && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
            <Ionicons name="eye-outline" size={44} color={color} />
            <Text_ muted>{t('exercises.starHint')}</Text_>
          </View>
        )}
        {phase === 'answer' && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm }}>
            <Ionicons name="help-circle-outline" size={56} color={targetHex} />
            <Text_ variant="heading" style={{ textAlign: 'center', paddingHorizontal: spacing.lg }}>{t('exercises.starAnswerTitle')}</Text_>
          </View>
        )}
      </Stage>

      {phase === 'ready' && (
        <Card>
          <ReadyPanel
            icon="star-outline"
            color={color}
            title={t('exercises.starReadyTitle')}
            body={t('exercises.starReadyBody')}
            cta={t('exercises.ready')}
            onStart={() => setPhase('show')}
          />
        </Card>
      )}

      {phase === 'answer' && !fb && (
        <Card style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Azalt" onPress={() => setGuess(Math.max(0, guess - 1))} style={countBtn(color)}>
              <Ionicons name="remove" size={26} color={color} />
            </Pressable>
            <Text_ style={{ fontSize: scale(44), fontWeight: '800', color: colors.text }}>{guess}</Text_>
            <Pressable accessibilityRole="button" accessibilityLabel="Artır" onPress={() => setGuess(Math.min(params.maxStars, guess + 1))} style={countBtn(color)}>
              <Ionicons name="add" size={26} color={color} />
            </Pressable>
          </View>
          <Button title={t('exercises.submit')} onPress={submit} style={{ backgroundColor: color }} />
        </Card>
      )}

      <Feedback
        ok={fb ? fb.ok : null}
        id={fb?.id ?? -1}
        text={fb ? (fb.ok ? t('exercises.correctMsg') : t('exercises.expectedMsg', { value: round.targetCount })) : ''}
      />
      <Note color={color} />
    </View>
  );
}

function countBtn(color: string) {
  return {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: color + '1A',
  };
}

/* ───────────────────────── Flaş Sayılar ───────────────────────── */
export function FlashNumbersGame({ settings, onFinish }: GameProps) {
  const { colors, scale } = useTheme();
  const color = EXERCISES.flash_numbers.color;
  const size = useStageSize();
  const params = useMemo(() => flashParams(settings.difficulty, settings.speedMs), [settings.difficulty, settings.speedMs]);
  const rounds = useMemo(() => {
    const rng = createRng(seed());
    return Array.from({ length: params.rounds }, (_, i) => generateFlashRound(params, i, rng));
  }, [params]);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'flash' | 'input'>('ready');
  const [text, setText] = useState('');
  const [fb, setFb] = useState<{ ok: boolean; id: number } | null>(null);
  const inputs = useRef<{ input: string; responseMs: number }[]>([]);
  const inputStart = useRef(0);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const round = rounds[index];

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (phase !== 'flash') return;
    const id = setTimeout(() => {
      inputStart.current = Date.now();
      setPhase('input');
    }, round.flashMs);
    return () => clearTimeout(id);
  }, [phase, round]);

  const submit = () => {
    const ok = checkFlashAnswer(round, text);
    inputs.current.push({ input: text, responseMs: Date.now() - inputStart.current });
    setFb({ ok, id: index });
    const last = index + 1 >= rounds.length;
    timer.current = setTimeout(() => {
      setFb(null);
      setText('');
      if (last) {
        const s = summarizeFlash(rounds, inputs.current);
        onFinish({ score: s.score, accuracy: s.accuracy, avgResponseMs: s.avgResponseMs, durationMs: Date.now() - startedAt.current });
      } else {
        setIndex(index + 1);
        setPhase('ready');
      }
    }, FEEDBACK_MS);
  };

  return (
    <View style={{ gap: spacing.lg }}>
      <RoundHud done={index} total={rounds.length} color={color} label={t('exercises.round', { current: index + 1, total: rounds.length })} />

      <Stage size={size} color={color}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md }}>
          {phase === 'ready' && <Ionicons name="flash-outline" size={56} color={color} />}
          {phase === 'flash' && (
            <Animated.View entering={FadeIn.duration(40)}>
              <Text_ accessibilityLabel="Sayı" style={{ fontSize: scale(64), fontWeight: '900', letterSpacing: 6, color: colors.text }}>
                {round.value}
              </Text_>
            </Animated.View>
          )}
          {phase === 'input' && (
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {Array.from({ length: round.value.length }, (_, i) => (
                <View
                  key={i}
                  style={{ width: 40, height: 52, borderRadius: 12, borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text_ style={{ fontSize: scale(24), fontWeight: '800' }}>{text[i] ?? ''}</Text_>
                </View>
              ))}
            </View>
          )}
        </View>
      </Stage>

      {phase === 'ready' && (
        <Card>
          <ReadyPanel icon="flash-outline" color={color} title={t('exercises.flashReadyTitle')} body={t('exercises.flashReadyBody')} cta={t('exercises.ready')} onStart={() => setPhase('flash')} />
        </Card>
      )}

      {phase === 'input' && !fb && (
        <Card style={{ gap: spacing.md }}>
          <Text_ muted style={{ textAlign: 'center' }}>{t('exercises.whatWasShown')}</Text_>
          <TextInput
            accessibilityLabel={t('exercises.whatWasShown')}
            value={text}
            onChangeText={(v) => setText(v.replace(/\D/g, '').slice(0, round.value.length))}
            keyboardType="number-pad"
            autoFocus
            style={{ minHeight: 56, borderBottomWidth: 3, borderBottomColor: color, fontSize: scale(28), color: colors.text, textAlign: 'center', letterSpacing: 8, fontWeight: '800' }}
          />
          <Button title={t('exercises.submit')} disabled={text.length === 0} onPress={submit} style={{ backgroundColor: color }} />
        </Card>
      )}

      <Feedback ok={fb ? fb.ok : null} id={fb?.id ?? -1} text={fb ? (fb.ok ? t('exercises.correctMsg') : t('exercises.expectedMsg', { value: round.value })) : ''} />
      <Note color={color} />
    </View>
  );
}

/* ───────────────────────── Harfleri Gör ───────────────────────── */
export function PeripheralGame({ settings, onFinish }: GameProps) {
  const { colors, scale, reducedMotion } = useTheme();
  const color = EXERCISES.peripheral_letters.color;
  const size = useStageSize();
  const params = useMemo(() => peripheralParams(settings.difficulty, settings.speedMs), [settings.difficulty, settings.speedMs]);
  const rounds = useMemo(() => {
    const rng = createRng(seed());
    return Array.from({ length: params.rounds }, (_, i) => generatePeripheralRound(params, i, rng));
  }, [params]);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'flash' | 'count'>('ready');
  const [guess, setGuess] = useState(0);
  const [fb, setFb] = useState<{ ok: boolean; id: number } | null>(null);
  const guesses = useRef<(number | null)[]>([]);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const round = rounds[index];

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (phase !== 'flash') return;
    const id = setTimeout(() => setPhase('count'), round.flashMs);
    return () => clearTimeout(id);
  }, [phase, round]);

  const submit = () => {
    const ok = checkPeripheralAnswer(round, guess);
    guesses.current.push(guess);
    setFb({ ok, id: index });
    const last = index + 1 >= rounds.length;
    timer.current = setTimeout(() => {
      setFb(null);
      setGuess(0);
      if (last) {
        const s = summarizePeripheral(rounds, guesses.current);
        onFinish({ score: s.score, accuracy: s.accuracy, avgResponseMs: null, durationMs: Date.now() - startedAt.current });
      } else {
        setIndex(index + 1);
        setPhase('ready');
      }
    }, FEEDBACK_MS);
  };

  return (
    <View style={{ gap: spacing.lg }}>
      <RoundHud done={index} total={rounds.length} color={color} label={t('exercises.round', { current: index + 1, total: rounds.length })} />

      <Stage size={size} color={color}>
        {/* Merkez artı ve yardımcı halka her zaman görünür: göz bu noktaya sabitlenir. */}
        <View style={{ position: 'absolute', left: size / 2 - 60, top: size / 2 - 60, width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: color + '55', borderStyle: 'dashed' }} />
        <View style={{ position: 'absolute', left: size / 2 - 14, top: size / 2 - 14, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="add" size={28} color={colors.text} />
        </View>
        {phase === 'flash' && (
          <Animated.View key={`p-${index}`} entering={reducedMotion ? undefined : FadeIn.duration(70)} style={StyleSheet.absoluteFill}>
            {round.letters.map((l, i) => {
              const cx = 0.5 + round.radius * 0.8 * Math.cos(l.angle);
              const cy = 0.5 + round.radius * 0.8 * Math.sin(l.angle);
              return (
                <View
                  key={i}
                  style={{ position: 'absolute', left: cx * size - 18, top: cy * size - 18, width: 36, height: 36, borderRadius: 18, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text_ style={{ color: '#FFFFFF', fontSize: scale(18), fontWeight: '800' }}>{l.letter}</Text_>
                </View>
              );
            })}
          </Animated.View>
        )}
      </Stage>

      {phase === 'ready' && (
        <Card>
          <ReadyPanel icon="scan-outline" color={color} title={t('exercises.peripheralReadyTitle')} body={t('exercises.peripheralReadyBody')} cta={t('exercises.ready')} onStart={() => setPhase('flash')} />
        </Card>
      )}

      {phase === 'count' && !fb && (
        <Card style={{ gap: spacing.md }}>
          <Text_ variant="heading" style={{ textAlign: 'center' }}>{t('exercises.howManyLetters')}</Text_>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Azalt" onPress={() => setGuess(Math.max(0, guess - 1))} style={countBtn(color)}>
              <Ionicons name="remove" size={26} color={color} />
            </Pressable>
            <Text_ style={{ fontSize: scale(44), fontWeight: '800', color: colors.text }}>{guess}</Text_>
            <Pressable accessibilityRole="button" accessibilityLabel="Artır" onPress={() => setGuess(Math.min(params.maxLetters, guess + 1))} style={countBtn(color)}>
              <Ionicons name="add" size={26} color={color} />
            </Pressable>
          </View>
          <Button title={t('exercises.submit')} onPress={submit} style={{ backgroundColor: color }} />
        </Card>
      )}

      <Feedback ok={fb ? fb.ok : null} id={fb?.id ?? -1} text={fb ? (fb.ok ? t('exercises.correctMsg') : t('exercises.expectedMsg', { value: round.letters.length })) : ''} />
      <Note color={color} />
    </View>
  );
}

/* ───────────────────────── Nesneyi Takip Et ───────────────────────── */
export function TrackingGame({ settings, onFinish }: GameProps) {
  const { colors, scale, reducedMotion } = useTheme();
  const color = EXERCISES.tracking.color;
  const size = useStageSize();
  const params = useMemo(
    () => trackingParams(settings.difficulty, settings.durationSec, settings.speedMs),
    [settings.difficulty, settings.durationSec, settings.speedMs],
  );
  const windows = useMemo(() => generateTargetWindows(params, createRng(seed())), [params]);

  const [phase, setPhase] = useState<'ready' | 'running' | 'done'>('ready');
  const [elapsed, setElapsed] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const [flash, setFlash] = useState<{ ok: boolean; id: number } | null>(null);
  const startedAt = useRef(0);
  const taps = useRef<number[]>([]);
  const finished = useRef(false);
  const finishRef = useRef(onFinish);
  const pulse = useSharedValue(1);

  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    if (phase !== 'running' || reducedMotion) return;
    pulse.value = withRepeat(withTiming(1.35, { duration: 420, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [phase, reducedMotion, pulse]);

  useEffect(() => {
    if (phase !== 'running') return;
    const id = setInterval(() => {
      const e = Date.now() - startedAt.current;
      if (e >= params.durationMs) {
        clearInterval(id);
        if (finished.current) return;
        finished.current = true;
        const s = scoreTracking(windows, taps.current);
        setPhase('done');
        finishRef.current({ score: s.score, accuracy: s.accuracy, avgResponseMs: s.avgResponseMs, durationMs: params.durationMs });
        return;
      }
      setElapsed(e);
    }, 33);
    return () => clearInterval(id);
  }, [phase, params, windows]);

  const pos = trackingPosition(elapsed, params);
  const targetNow = windows.some((w) => elapsed >= w.startMs && elapsed <= w.endMs);
  const dot = size * 0.075;
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const timeLeft = Math.max(0, Math.ceil((params.durationMs - elapsed) / 1000));

  const onTap = () => {
    if (phase !== 'running') return;
    const at = Date.now() - startedAt.current;
    taps.current.push(at);
    const hit = windows.some((w) => at >= w.startMs && at <= w.endMs);
    if (hit) setHitCount((n) => n + 1);
    setFlash({ ok: hit, id: at });
  };

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={chipStyle(color)}>
          <Ionicons name="checkmark-done" size={16} color={color} />
          <Text_ variant="label" style={{ color }}>{`${hitCount}`}</Text_>
        </View>
        <View style={chipStyle(color)}>
          <Ionicons name="time-outline" size={16} color={color} />
          <Text_ variant="label" style={{ color }}>{t('exercises.timeLeft', { value: phase === 'running' ? timeLeft : Math.round(params.durationMs / 1000) })}</Text_>
        </View>
      </View>

      <Stage size={size} color={color} onPress={onTap} label={t('exercises.trackingHint')}>
        {phase === 'running' && (
          <>
            <View
              style={{
                position: 'absolute',
                left: pos.x * size - dot,
                top: pos.y * size - dot,
                width: dot * 2,
                height: dot * 2,
                borderRadius: dot,
                backgroundColor: targetNow ? colors.accentStar + '55' : color + '22',
              }}
            />
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  left: pos.x * size - dot / 2,
                  top: pos.y * size - dot / 2,
                  width: dot,
                  height: dot,
                  borderRadius: dot / 2,
                  backgroundColor: targetNow ? colors.accentStar : color,
                  borderWidth: targetNow ? 3 : 0,
                  borderColor: colors.text,
                },
                targetNow ? ringStyle : undefined,
              ]}
            />
          </>
        )}
        {phase === 'ready' && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
            <Ionicons name="eye-outline" size={48} color={color} />
            <Text_ muted style={{ fontSize: scale(15) }}>{t('exercises.trackingReadyBody')}</Text_>
          </View>
        )}
        {flash && phase === 'running' && (
          <View pointerEvents="none" style={{ position: 'absolute', top: spacing.md, left: 0, right: 0, alignItems: 'center' }}>
            <Feedback ok={flash.ok} id={flash.id} text={flash.ok ? t('exercises.hitMsg') : t('exercises.falseAlarms')} />
          </View>
        )}
      </Stage>

      {phase === 'ready' && (
        <Card>
          <ReadyPanel icon="eye-outline" color={color} title={t('exercises.trackingReadyTitle')} body={t('exercises.trackingReadyBody')} cta={t('exercises.ready')} onStart={() => {
            startedAt.current = Date.now();
            finished.current = false;
            taps.current = [];
            setHitCount(0);
            setElapsed(0);
            setPhase('running');
          }} />
        </Card>
      )}
      {phase === 'running' && <Text_ variant="label" muted style={{ textAlign: 'center' }}>{t('exercises.trackingHint')}</Text_>}
      <Note color={color} />
    </View>
  );
}

function chipStyle(color: string) {
  return {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: color + '1A',
  };
}

/* ───────────────────────── Zigzag (yatay / dikey) ───────────────────────── */
export function ZigzagGame({ settings, orientation, onFinish }: GameProps & { orientation: 'horizontal' | 'vertical' }) {
  const { colors, reducedMotion } = useTheme();
  const color = orientation === 'horizontal' ? EXERCISES.zigzag_horizontal.color : EXERCISES.zigzag_vertical.color;
  const size = useStageSize();
  const params = useMemo(() => zigzagParams(orientation, settings.difficulty, settings.speedMs), [orientation, settings.difficulty, settings.speedMs]);
  const steps = useMemo(() => generateZigzagSteps(params), [params]);

  const [phase, setPhase] = useState<'ready' | 'running'>('ready');
  const [index, setIndex] = useState(0);
  const [hits, setHits] = useState(0);
  const [flash, setFlash] = useState<{ ok: boolean; id: number } | null>(null);
  const responses = useRef<(number | null)[]>([]);
  const stepStart = useRef(0);
  const startedAt = useRef(0);
  const finishRef = useRef(onFinish);
  const current = steps[index];
  const dot = size * 0.09;
  const edgeA = orientation === 'horizontal' ? t('exercises.left') : t('exercises.top');
  const edgeB = orientation === 'horizontal' ? t('exercises.right') : t('exercises.bottom');

  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    if (phase !== 'running') return;
    stepStart.current = Date.now();
    const id = setTimeout(() => {
      responses.current[index] = responses.current[index] ?? null;
      if (index + 1 >= steps.length) {
        setPhase('ready');
        const s = summarizeZigzag(responses.current, params.intervalMs);
        finishRef.current({ score: s.score, accuracy: s.accuracy, avgResponseMs: s.avgResponseMs, durationMs: Date.now() - startedAt.current });
      } else {
        setIndex(index + 1);
      }
    }, params.intervalMs);
    return () => clearTimeout(id);
  }, [phase, index, steps, params]);

  const tap = () => {
    if (phase !== 'running' || responses.current[index] !== undefined) return;
    const rt = Date.now() - stepStart.current;
    const ok = rt <= params.intervalMs;
    responses.current[index] = rt;
    setFlash({ ok, id: index });
    if (ok) setHits((h) => h + 1);
  };

  const px = current.position.x * size;
  const py = current.position.y * size;

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={chipStyle(color)}>
          <Ionicons name="flash-outline" size={16} color={color} />
          <Text_ variant="label" style={{ color }}>{String(hits)}</Text_>
        </View>
        <Text_ variant="label" muted style={{ alignSelf: 'center' }}>
          {t('exercises.round', { current: Math.min(index + 1, steps.length), total: steps.length })}
        </Text_>
      </View>

      <Stage size={size} color={color} onPress={tap} label={t('exercises.zigzagTapHint')}>
        <View pointerEvents="none" style={orientation === 'horizontal'
          ? { position: 'absolute', left: size * 0.15, top: size * 0.1, bottom: size * 0.1, width: 2, backgroundColor: color + '44' }
          : { position: 'absolute', top: size * 0.15, left: size * 0.1, right: size * 0.1, height: 2, backgroundColor: color + '44' }} />
        <View pointerEvents="none" style={orientation === 'horizontal'
          ? { position: 'absolute', left: size * 0.85, top: size * 0.1, bottom: size * 0.1, width: 2, backgroundColor: color + '44' }
          : { position: 'absolute', top: size * 0.85, left: size * 0.1, right: size * 0.1, height: 2, backgroundColor: color + '44' }} />
        <View pointerEvents="none" style={{ position: 'absolute', left: size / 2 - 5, top: size / 2 - 5, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border }} />
        <Text_ variant="caption" muted style={orientation === 'horizontal' ? { position: 'absolute', left: 8, top: size / 2 - 8 } : { position: 'absolute', top: 8, left: size / 2 - 12 }}>{edgeA}</Text_>
        <Text_ variant="caption" muted style={orientation === 'horizontal' ? { position: 'absolute', right: 8, top: size / 2 - 8 } : { position: 'absolute', bottom: 8, left: size / 2 - 12 }}>{edgeB}</Text_>

        {phase === 'running' && (
          <Animated.View
            key={`z-${index}`}
            entering={reducedMotion ? undefined : FadeIn.duration(60)}
            style={{ position: 'absolute', left: px - dot / 2, top: py - dot / 2, width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color, borderWidth: 4, borderColor: '#FFFFFF33' }}
          />
        )}
        {phase === 'ready' && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
            <Ionicons name={orientation === 'horizontal' ? 'swap-horizontal-outline' : 'swap-vertical-outline'} size={48} color={color} />
          </View>
        )}
        {flash && phase === 'running' && (
          <View pointerEvents="none" style={{ position: 'absolute', top: spacing.sm, left: 0, right: 0, alignItems: 'center' }}>
            <Feedback ok={flash.ok} id={flash.id} text={flash.ok ? t('exercises.correctMsg') : t('exercises.missMsg')} />
          </View>
        )}
      </Stage>

      {phase === 'ready' && (
        <Card>
          <ReadyPanel
            icon={orientation === 'horizontal' ? 'swap-horizontal-outline' : 'swap-vertical-outline'}
            color={color}
            title={t('exercises.zigzagReadyTitle')}
            body={t('exercises.zigzagReadyBody')}
            cta={t('exercises.ready')}
            onStart={() => {
              startedAt.current = Date.now();
              responses.current = [];
              setHits(0);
              setFlash(null);
              setIndex(0);
              setPhase('running');
            }}
          />
        </Card>
      )}
      <Note color={color} />
    </View>
  );
}

/** Egzersiz anahtarına göre doğru oyun bileşenini seçer. */
export function ExerciseGame({ exerciseKey, settings, onFinish }: GameProps & { exerciseKey: ExerciseKey }) {
  switch (exerciseKey) {
    case 'schulte':
      return <SchulteGame settings={settings} onFinish={onFinish} onQuit={() => undefined} />;
    case 'star_hunter':
      return <StarHunterGame settings={settings} onFinish={onFinish} />;
    case 'flash_numbers':
      return <FlashNumbersGame settings={settings} onFinish={onFinish} />;
    case 'peripheral_letters':
      return <PeripheralGame settings={settings} onFinish={onFinish} />;
    case 'tracking':
      return <TrackingGame settings={settings} onFinish={onFinish} />;
    case 'zigzag_horizontal':
      return <ZigzagGame settings={settings} orientation="horizontal" onFinish={onFinish} />;
    case 'zigzag_vertical':
      return <ZigzagGame settings={settings} orientation="vertical" onFinish={onFinish} />;
    case 'word_blocks':
      return <WordBlocksGame settings={settings} onFinish={onFinish} />;
    case 'scan_search':
      return <ScanSearchGame settings={settings} onFinish={onFinish} />;
    case 'skim_read':
      return <SkimGame settings={settings} onFinish={onFinish} />;
    case 'synonym_match':
      return <SynonymGame settings={settings} onFinish={onFinish} />;
    case 'line_scan':
      return <LineScanGame settings={settings} onFinish={onFinish} />;
    case 'rsvp_repeat':
      return <RsvpGame settings={settings} onFinish={onFinish} />;
  }
}
