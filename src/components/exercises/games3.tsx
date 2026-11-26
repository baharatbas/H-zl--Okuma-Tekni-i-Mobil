import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Text_ } from '../ui';
import { Feedback, ReadyPanel, RoundHud } from './shared';
import { radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';
import { createRng } from '../../core/rng';
import type { ExerciseResult, ExerciseSettings } from '../../core/exercises/types';
import { EXERCISES } from '../../core/exercises/registry';
import { generateSynonymRound, summarizeSynonyms, synonymParams, SynonymRound } from '../../core/exercises/synonyms';
import { generateLineScanRound, lineScanParams, summarizeLineScan, LineScanRound } from '../../core/exercises/lineScan';
import { generateRsvpStream, rsvpParams, scoreRsvp, RsvpStream } from '../../core/exercises/rsvpRepeat';

interface GameProps {
  settings: ExerciseSettings;
  onFinish: (result: ExerciseResult) => void;
}

const FEEDBACK_MS = 850;
/** Olay anında geçen süre (ms); olay işleyicilerinde kullanılır. */
const elapsedSince = (startMs: number) => Date.now() - startMs;

const seed = () => (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;

/* ───────────────────────── Eş Anlam Yakalama ───────────────────────── */
export function SynonymGame({ settings, onFinish }: GameProps) {
  const { colors, scale } = useTheme();
  const color = EXERCISES.synonym_match.color;
  const rounds = useMemo(() => {
    const rng = createRng(seed());
    const n = synonymParams(settings.difficulty).rounds;
    return Array.from({ length: n }, (_, i) => generateSynonymRound(n, i, rng));
  }, [settings.difficulty]);

  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [fb, setFb] = useState<{ ok: boolean; id: number } | null>(null);
  const answers = useRef<(number | null)[]>([]);
  const times = useRef<(number | null)[]>([]);
  const shownAt = useRef(0);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const round: SynonymRound = rounds[index];

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const choose = (opt: number) => {
    const ok = opt === round.correctIndex;
    answers.current.push(opt);
    times.current.push(elapsedSince(shownAt.current));
    setFb({ ok, id: index });
    const last = index + 1 >= rounds.length;
    timer.current = setTimeout(() => {
      setFb(null);
      if (last) {
        const s = summarizeSynonyms(rounds, answers.current, times.current);
        onFinish({ score: s.score, accuracy: s.accuracy, avgResponseMs: s.avgResponseMs, durationMs: Date.now() - startedAt.current });
      } else {
        shownAt.current = Date.now();
        setIndex(index + 1);
      }
    }, FEEDBACK_MS);
  };

  if (!started) {
    return (
      <Card>
        <ReadyPanel
          icon="git-compare-outline"
          color={color}
          title={t('exercises.synonymReadyTitle')}
          body={t('exercises.synonymReadyBody')}
          cta={t('exercises.ready')}
          onStart={() => {
            startedAt.current = Date.now();
            shownAt.current = Date.now();
            setStarted(true);
          }}
        />
      </Card>
    );
  }

  return (
    <View style={{ gap: spacing.lg }}>
      <RoundHud done={index} total={rounds.length} color={color} label={t('exercises.round', { current: index + 1, total: rounds.length })} />
      <Card style={{ alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm }}>
        <Text_ variant="caption" muted>{t('exercises.synonymAsk')}</Text_>
        <Text_ accessibilityLabel={round.word} style={{ fontSize: scale(34), fontWeight: '900', color }}>{round.word}</Text_>
      </Card>
      <View style={{ gap: spacing.sm }}>
        {round.options.map((opt, i) => (
          <Pressable
            key={`${index}-${i}`}
            accessibilityRole="button"
            accessibilityLabel={opt}
            disabled={!!fb}
            onPress={() => choose(i)}
            style={({ pressed }) => ({ minHeight: 56, borderRadius: radius.md, justifyContent: 'center', paddingHorizontal: spacing.md, backgroundColor: pressed ? color + '33' : colors.surface, borderWidth: 2, borderColor: fb && i === round.correctIndex ? colors.success : colors.border })}
          >
            <Text_ style={{ textAlign: 'center', fontWeight: '700' }}>{opt}</Text_>
          </Pressable>
        ))}
      </View>
      <Feedback ok={fb ? fb.ok : null} id={fb?.id ?? -1} text={fb ? (fb.ok ? t('exercises.correctMsg') : t('exercises.expectedMsg', { value: round.options[round.correctIndex] })) : ''} />
    </View>
  );
}

/* ───────────────────────── Satır Tarama ───────────────────────── */
export function LineScanGame({ settings, onFinish }: GameProps) {
  const { colors } = useTheme();
  const color = EXERCISES.line_scan.color;
  const params = useMemo(() => lineScanParams(settings.difficulty), [settings.difficulty]);
  const rounds = useMemo(() => {
    const rng = createRng(seed());
    return Array.from({ length: params.rounds }, (_, i) => generateLineScanRound(params, i, rng));
  }, [params]);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'scan' | 'done'>('ready');
  const [fb, setFb] = useState<{ ok: boolean; id: number } | null>(null);
  const answers = useRef<(number | null)[]>([]);
  const times = useRef<(number | null)[]>([]);
  const shownAt = useRef(0);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const round: LineScanRound = rounds[index];

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const pickLine = (li: number) => {
    if (phase !== 'scan') return;
    const ok = li === round.targetLine;
    answers.current.push(li);
    times.current.push(elapsedSince(shownAt.current));
    setFb({ ok, id: index });
    setPhase('done');
    const last = index + 1 >= rounds.length;
    timer.current = setTimeout(() => {
      setFb(null);
      if (last) {
        const s = summarizeLineScan(rounds, answers.current, times.current);
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
      {phase === 'ready' && (
        <Card>
          <ReadyPanel
            icon="list-outline"
            color={color}
            title={t('exercises.lineScanReadyTitle')}
            body={t('exercises.lineScanReadyBody', { target: round.targetWord })}
            cta={t('exercises.ready')}
            onStart={() => {
              if (!startedAt.current) startedAt.current = Date.now();
              shownAt.current = Date.now();
              setPhase('scan');
            }}
          />
        </Card>
      )}
      {phase !== 'ready' && (
        <>
          <Text_ variant="label" style={{ color }}>{`${t('exercises.lineScanAsk')}: ${round.targetWord}`}</Text_>
          <View style={{ gap: spacing.sm }}>
            {round.lines.map((line, li) => (
              <Pressable
                key={`${index}-${li}`}
                accessibilityRole="button"
                accessibilityLabel={`Satır ${li + 1}: ${line}`}
                disabled={phase !== 'scan'}
                onPress={() => pickLine(li)}
                style={({ pressed }) => ({ padding: spacing.md, borderRadius: radius.md, backgroundColor: pressed ? color + '1A' : colors.surface, borderWidth: 1, borderColor: fb && li === round.targetLine ? colors.success : colors.border, flexDirection: 'row', gap: spacing.sm })}
              >
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: color + '22', alignItems: 'center', justifyContent: 'center' }}>
                  <Text_ variant="caption" style={{ color, fontWeight: '700' }}>{String(li + 1)}</Text_>
                </View>
                <Text_ style={{ flex: 1, lineHeight: 22 }}>{line}</Text_>
              </Pressable>
            ))}
          </View>
        </>
      )}
      <Feedback ok={fb ? fb.ok : null} id={fb?.id ?? -1} text={fb ? (fb.ok ? t('exercises.correctMsg') : t('exercises.missMsg')) : ''} />
    </View>
  );
}

/* ───────────────────────── Kelime Akışı ───────────────────────── */
export function RsvpGame({ settings, onFinish }: GameProps) {
  const { colors, scale } = useTheme();
  const color = EXERCISES.rsvp_repeat.color;
  const { width } = useWindowDimensions();
  const size = Math.min(width - spacing.lg * 2, 340);
  const params = useMemo(() => rsvpParams(settings.difficulty, settings.speedMs), [settings.difficulty, settings.speedMs]);
  const stream: RsvpStream = useMemo(() => generateRsvpStream(params, createRng(seed())), [params]);

  const [phase, setPhase] = useState<'ready' | 'run' | 'done'>('ready');
  const [idx, setIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [flash, setFlash] = useState<{ ok: boolean; id: number } | null>(null);
  const taps = useRef<number[]>([]);
  const startedAt = useRef(0);
  const finishRef = useRef(onFinish);

  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    if (phase !== 'run') return;
    const id = setInterval(() => {
      const e = Date.now() - startedAt.current;
      const i = Math.floor(e / stream.wordMs);
      if (i >= stream.words.length) {
        clearInterval(id);
        setPhase('done');
        const s = scoreRsvp(stream, taps.current);
        finishRef.current({ score: s.score, accuracy: s.accuracy, avgResponseMs: s.avgResponseMs, durationMs: stream.words.length * stream.wordMs });
        return;
      }
      setIdx(i);
    }, 16);
    return () => clearInterval(id);
  }, [phase, stream]);

  const tap = () => {
    if (phase !== 'run') return;
    const at = Date.now() - startedAt.current;
    taps.current.push(at);
    const i = Math.floor(at / stream.wordMs);
    const ok = stream.repeats.includes(i);
    if (ok) setHits((h) => h + 1);
    setFlash({ ok, id: at });
  };

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, backgroundColor: color + '1A' }}>
          <Ionicons name="checkmark-done" size={16} color={color} />
          <Text_ variant="label" style={{ color }}>{String(hits)}</Text_>
        </View>
        {phase === 'run' && <Text_ variant="label" muted>{`${idx + 1} / ${stream.words.length}`}</Text_>}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('exercises.rsvpTapHint')}
        onPress={tap}
        disabled={phase !== 'run'}
        style={{ alignSelf: 'center', width: size, height: size * 0.6, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 2, borderColor: color + '40', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
      >
        {phase === 'run' && (
          <Animated.View key={idx} entering={FadeIn.duration(40)} style={{ alignItems: 'center' }}>
            <Text_ style={{ fontSize: scale(32), fontWeight: '800', color: colors.text }}>{stream.words[idx]}</Text_>
          </Animated.View>
        )}
        {phase === 'ready' && <Ionicons name="play-skip-forward-outline" size={56} color={color} />}
        {flash && phase === 'run' && (
          <View pointerEvents="none" style={{ position: 'absolute', top: spacing.sm }}>
            <Feedback ok={flash.ok} id={flash.id} text={flash.ok ? t('exercises.hitMsg') : t('exercises.falseAlarms')} />
          </View>
        )}
      </Pressable>

      {phase === 'ready' && (
        <Card>
          <ReadyPanel
            icon="play-skip-forward-outline"
            color={color}
            title={t('exercises.rsvpReadyTitle')}
            body={t('exercises.rsvpReadyBody')}
            cta={t('exercises.ready')}
            onStart={() => {
              taps.current = [];
              setHits(0);
              setFlash(null);
              setIdx(0);
              startedAt.current = Date.now();
              setPhase('run');
            }}
          />
        </Card>
      )}
      {phase === 'run' && <Button title={t('exercises.rsvpTap')} onPress={tap} style={{ backgroundColor: color }} />}
    </View>
  );
}
