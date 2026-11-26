/** Dikkat ve ritim oyunları: Nesneyi Takip Et, Zigzag, Kelime Akışı. */
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Text_ } from '../ui';
import { Board, Center, GameProps, GameShell, Hint, Verdict, elapsedSince, newSeed, nowMs, useDelay } from './shell';
import { EXERCISES } from '../../core/exercises/registry';
import { generateTargetWindows, scoreTracking, trackingParams, trackingPosition } from '../../core/exercises/tracking';
import { generateZigzagSteps, summarizeZigzag, zigzagParams } from '../../core/exercises/zigzag';
import { generateRsvpStream, rsvpParams, rsvpWindows, scoreRsvp } from '../../core/exercises/rsvpRepeat';
import { createRng } from '../../core/rng';
import { haptic } from '../../services/haptics';
import { radius, useTheme } from '../../theme';
import { t } from '../../i18n';

const READY_MS = 2000;

/** Oyun başlamadan önce yönergeyi gösterir. */
function Ready({ icon, color, text }: { icon: string; color: string; text: string }) {
  return (
    <Center>
      <Ionicons name={icon as any} size={48} color={color} />
      <Text_ variant="heading" style={{ textAlign: 'center' }}>{t('exercises.getReady')}</Text_>
      <Hint text={text} />
    </Center>
  );
}

/** Akan zaman: `running` iken her karede geçen ms; süre dolunca `onEnd` bir kez çağrılır. */
function useClock(running: boolean, durationMs: number, onEnd: () => void) {
  const [elapsed, setElapsed] = useState(0);
  const start = useRef(0);
  const endRef = useRef(onEnd);
  useEffect(() => {
    endRef.current = onEnd;
  });
  useEffect(() => {
    if (!running) return;
    start.current = nowMs();
    const id = setInterval(() => {
      const e = elapsedSince(start.current);
      setElapsed(Math.min(e, durationMs));
      if (e >= durationMs) {
        clearInterval(id);
        endRef.current();
      }
    }, 30);
    return () => clearInterval(id);
  }, [running, durationMs]);
  return { elapsed, start };
}

export function TrackingGame({ settings, onFinish, onQuit }: GameProps) {
  const { colors } = useTheme();
  const meta = EXERCISES.tracking;
  const [params] = useState(() => trackingParams(settings.difficulty, settings.durationSec, settings.speedMs));
  const [windows] = useState(() => generateTargetWindows(params, createRng(newSeed())));
  const [running, setRunning] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; id: number } | null>(null);
  const taps = useRef<number[]>([]);
  const hit = useRef(new Set<number>());
  const [hits, setHits] = useState(0);

  useDelay(!running, READY_MS, () => setRunning(true));
  const { elapsed, start } = useClock(running, params.durationMs, () => {
    const s = scoreTracking(windows, taps.current);
    onFinish({ score: s.score, accuracy: s.accuracy, avgResponseMs: s.avgResponseMs, durationMs: params.durationMs });
  });
  useDelay(feedback !== null, 700, () => setFeedback(null), feedback?.id);

  const target = windows.some((w) => elapsed >= w.startMs && elapsed <= w.endMs);
  const tap = () => {
    if (!running) return;
    const at = elapsedSince(start.current);
    taps.current.push(at);
    const i = windows.findIndex((w, k) => !hit.current.has(k) && at >= w.startMs && at <= w.endMs);
    if (i >= 0) {
      hit.current.add(i);
      setHits(hit.current.size);
    }
    haptic(i >= 0 ? 'success' : 'error');
    setFeedback({ ok: i >= 0, id: at });
  };
  const pos = trackingPosition(elapsed, params);

  return (
    <GameShell
      title={meta.name}
      subtitle={t('exercises.hitCount', { value: hits })}
      color={meta.color}
      progress={elapsed / params.durationMs}
      badge={`${Math.ceil((params.durationMs - elapsed) / 1000)} sn`}
      onQuit={onQuit}
      footer={feedback ? <Verdict ok={feedback.ok} text={feedback.ok ? t('exercises.hitMsg') : t('exercises.falseAlarms')} /> : <Hint text={t('exercises.trackingHint')} />}
    >
      {({ size }) => {
        const dot = size * 0.08;
        return (
          <Board size={size} onPress={tap} label={t('exercises.trackingHint')}>
            {!running ? (
              <Ready icon={meta.icon} color={meta.color} text={t('exercises.trackingReadyBody')} />
            ) : (
              <>
                {target ? <View style={{ position: 'absolute', left: pos.x * size - dot, top: pos.y * size - dot, width: dot * 2, height: dot * 2, borderRadius: dot, borderWidth: 3, borderColor: colors.accentStar }} /> : null}
                <View style={{ position: 'absolute', left: pos.x * size - dot / 2, top: pos.y * size - dot / 2, width: dot, height: dot, borderRadius: dot / 2, backgroundColor: target ? colors.accentStar : meta.color }} />
              </>
            )}
          </Board>
        );
      }}
    </GameShell>
  );
}

export function ZigzagGame({ settings, onFinish, onQuit, orientation }: GameProps & { orientation: 'horizontal' | 'vertical' }) {
  const { colors } = useTheme();
  const meta = orientation === 'horizontal' ? EXERCISES.zigzag_horizontal : EXERCISES.zigzag_vertical;
  const [params] = useState(() => zigzagParams(orientation, settings.difficulty, settings.speedMs));
  const [steps] = useState(() => generateZigzagSteps(params));
  const [index, setIndex] = useState(-1);
  const [hits, setHits] = useState(0);
  const [tapped, setTapped] = useState(false);
  const responses = useRef<(number | null)[]>([]);
  const stepStart = useRef(0);
  const startedAt = useRef(0);
  const running = index >= 0;

  useDelay(!running, READY_MS, () => {
    startedAt.current = nowMs();
    stepStart.current = nowMs();
    setIndex(0);
  });
  useDelay(running, params.intervalMs, () => {
    responses.current[index] = responses.current[index] ?? null;
    if (index + 1 >= steps.length) {
      const s = summarizeZigzag(responses.current, params.intervalMs);
      onFinish({ score: s.score, accuracy: s.accuracy, avgResponseMs: s.avgResponseMs, durationMs: elapsedSince(startedAt.current) });
      return;
    }
    stepStart.current = nowMs();
    setTapped(false);
    setIndex(index + 1);
  }, index);

  const tap = () => {
    if (!running || responses.current[index] !== undefined) return;
    responses.current[index] = elapsedSince(stepStart.current);
    setTapped(true);
    setHits((h) => h + 1);
    haptic('light');
  };
  const step = steps[Math.max(0, index)];

  return (
    <GameShell
      title={meta.name}
      subtitle={t('exercises.hitCount', { value: hits })}
      color={meta.color}
      progress={Math.max(0, index) / steps.length}
      badge={`${Math.max(0, index) + (running ? 1 : 0)}/${steps.length}`}
      onQuit={onQuit}
      footer={<Hint text={t('exercises.zigzagTapHint')} />}
    >
      {({ size }) => {
        const dot = size * 0.13;
        return (
          <Board size={size} onPress={tap} label={t('exercises.zigzagTapHint')}>
            {!running ? (
              <Ready icon={meta.icon} color={meta.color} text={t('exercises.zigzagReadyBody')} />
            ) : (
              <>
                <View style={{ position: 'absolute', left: size / 2 - 5, top: size / 2 - 5, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border }} />
                <View style={{ position: 'absolute', left: step.position.x * size - dot / 2, top: step.position.y * size - dot / 2, width: dot, height: dot, borderRadius: dot / 2, backgroundColor: tapped ? colors.success : meta.color, alignItems: 'center', justifyContent: 'center' }}>
                  {tapped ? <Ionicons name="checkmark" size={dot * 0.6} color="#FFFFFF" /> : null}
                </View>
              </>
            )}
          </Board>
        );
      }}
    </GameShell>
  );
}

export function RsvpGame({ settings, onFinish, onQuit }: GameProps) {
  const { colors, scale } = useTheme();
  const meta = EXERCISES.rsvp_repeat;
  const [stream] = useState(() => generateRsvpStream(rsvpParams(settings.difficulty, settings.speedMs), createRng(newSeed())));
  const [windows] = useState(() => rsvpWindows(stream));
  const [running, setRunning] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; id: number } | null>(null);
  const [hits, setHits] = useState(0);
  const taps = useRef<number[]>([]);
  const hit = useRef(new Set<number>());
  const total = stream.words.length * stream.wordMs;

  useDelay(!running, READY_MS, () => setRunning(true));
  // Son kelimeden sonra tepki payı kadar beklenir.
  const { elapsed, start } = useClock(running, total + 500, () => {
    const s = scoreRsvp(stream, taps.current);
    onFinish({ score: s.score, accuracy: s.accuracy, avgResponseMs: s.avgResponseMs, durationMs: total });
  });
  useDelay(feedback !== null, 700, () => setFeedback(null), feedback?.id);

  const index = Math.min(stream.words.length - 1, Math.floor(elapsed / stream.wordMs));
  // Her kelimeden önce kısa boşluk: aynı kelime tekrar geldiğinde fark edilir.
  const blank = elapsed % stream.wordMs < Math.min(80, stream.wordMs * 0.25);

  const tap = () => {
    if (!running) return;
    const at = elapsedSince(start.current);
    taps.current.push(at);
    const i = windows.findIndex((w, k) => !hit.current.has(k) && at >= w.startMs && at <= w.endMs);
    if (i >= 0) {
      hit.current.add(i);
      setHits(hit.current.size);
    }
    haptic(i >= 0 ? 'success' : 'error');
    setFeedback({ ok: i >= 0, id: at });
  };

  return (
    <GameShell
      title={meta.name}
      subtitle={t('exercises.hitCount', { value: hits })}
      color={meta.color}
      progress={elapsed / total}
      badge={`${index + (running ? 1 : 0)}/${stream.words.length}`}
      onQuit={onQuit}
      footer={
        <>
          {feedback ? <Verdict ok={feedback.ok} text={feedback.ok ? t('exercises.hitMsg') : t('exercises.falseAlarms')} /> : <Hint text={t('exercises.rsvpTapHint')} />}
          <Button title={t('exercises.rsvpTap')} onPress={tap} disabled={!running} hapticOnPress={false} />
        </>
      }
    >
      {({ size }) => (
        <Pressable accessibilityRole="button" accessibilityLabel={t('exercises.rsvpTapHint')} onPressIn={tap} style={{ width: size, height: size * 0.7, borderRadius: radius.lg, backgroundColor: colors.surface, justifyContent: 'center' }}>
          {!running ? (
            <Ready icon={meta.icon} color={meta.color} text={t('exercises.rsvpReadyBody')} />
          ) : (
            <Text_ allowFontScaling={false} style={{ fontSize: scale(36), lineHeight: scale(44), fontWeight: '700', textAlign: 'center' }}>{blank ? ' ' : stream.words[index]}</Text_>
          )}
        </Pressable>
      )}
    </GameShell>
  );
}
