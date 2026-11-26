import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Text_ } from '../ui';
import { Feedback, ReadyPanel, RoundHud, Stage } from './shared';
import { radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';
import { createRng } from '../../core/rng';
import type { ExerciseResult, ExerciseSettings } from '../../core/exercises/types';
import { EXERCISES } from '../../core/exercises/registry';
import { wordBlockParams, generateWordBlockRound, checkWordBlockAnswer, summarizeWordBlocks } from '../../core/exercises/wordBlocks';
import { scanParams, generateScanRound, scoreScanRound, summarizeScan, GRID_COLS, ScanRoundResult } from '../../core/exercises/scanSearch';
import { pickSkimText, skimParams, summarizeSkim } from '../../core/exercises/skim';
import type { BuiltinText } from '../../content/builtinTexts';

interface GameProps {
  settings: ExerciseSettings;
  onFinish: (result: ExerciseResult) => void;
}

const FEEDBACK_MS = 850;
const seed = () => (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;

function useStageSize(): number {
  const { width } = useWindowDimensions();
  return Math.min(width - spacing.lg * 2, 340);
}

/* ───────────────────────── Kelime Blokları ───────────────────────── */
export function WordBlocksGame({ settings, onFinish }: GameProps) {
  const { colors, scale } = useTheme();
  const color = EXERCISES.word_blocks.color;
  const size = useStageSize();
  const params = useMemo(() => wordBlockParams(settings.difficulty, settings.speedMs), [settings.difficulty, settings.speedMs]);
  const rounds = useMemo(() => {
    const rng = createRng(seed());
    return Array.from({ length: params.rounds }, (_, i) => generateWordBlockRound(params, i, rng));
  }, [params]);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'flash' | 'choose'>('ready');
  const [fb, setFb] = useState<{ ok: boolean; id: number } | null>(null);
  const answers = useRef<(number | null)[]>([]);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const round = rounds[index];

  useEffect(() => {
    startedAt.current = Date.now();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'flash') return;
    const id = setTimeout(() => setPhase('choose'), round.flashMs);
    return () => clearTimeout(id);
  }, [phase, round]);

  const choose = (opt: number) => {
    const ok = checkWordBlockAnswer(round, opt);
    answers.current.push(opt);
    setFb({ ok, id: index });
    const last = index + 1 >= rounds.length;
    timer.current = setTimeout(() => {
      setFb(null);
      if (last) {
        const s = summarizeWordBlocks(rounds, answers.current);
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
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
          {phase === 'ready' && <Ionicons name="grid-outline" size={56} color={color} />}
          {phase === 'flash' && (
            <Animated.View entering={FadeIn.duration(40)}>
              <Text_ accessibilityLabel={round.phrase} style={{ fontSize: scale(24), fontWeight: '800', textAlign: 'center', color: colors.text }}>
                {round.phrase}
              </Text_>
            </Animated.View>
          )}
          {phase === 'choose' && <Ionicons name="help-circle-outline" size={56} color={color} />}
        </View>
      </Stage>

      {phase === 'ready' && (
        <Card>
          <ReadyPanel icon="grid-outline" color={color} title={t('exercises.wordBlocksReadyTitle')} body={t('exercises.wordBlocksReadyBody')} cta={t('exercises.ready')} onStart={() => setPhase('flash')} />
        </Card>
      )}

      {phase === 'choose' && !fb && (
        <Card style={{ gap: spacing.sm }}>
          <Text_ variant="heading" style={{ textAlign: 'center' }}>{t('exercises.wordBlocksChoose')}</Text_>
          {round.options.map((opt, i) => (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={opt}
              onPress={() => choose(i)}
              style={({ pressed }) => ({ minHeight: 52, borderRadius: radius.md, justifyContent: 'center', paddingHorizontal: spacing.md, backgroundColor: pressed ? color + '33' : colors.surfaceAlt, borderWidth: 1, borderColor: colors.border })}
            >
              <Text_ style={{ textAlign: 'center', fontWeight: '600' }}>{opt}</Text_>
            </Pressable>
          ))}
        </Card>
      )}

      <Feedback ok={fb ? fb.ok : null} id={fb?.id ?? -1} text={fb ? (fb.ok ? t('exercises.correctMsg') : t('exercises.expectedMsg', { value: round.phrase })) : ''} />
    </View>
  );
}

/* ───────────────────────── Hızlı Tarama ───────────────────────── */
export function ScanSearchGame({ settings, onFinish }: GameProps) {
  const { colors, scale } = useTheme();
  const color = EXERCISES.scan_search.color;
  const size = useStageSize();
  const params = useMemo(() => scanParams(settings.difficulty, settings.speedMs), [settings.difficulty, settings.speedMs]);
  const rounds = useMemo(() => {
    const rng = createRng(seed());
    return Array.from({ length: params.rounds }, (_, i) => generateScanRound(params, i, rng));
  }, [params]);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'search' | 'done'>('ready');
  const [marked, setMarked] = useState<number[]>([]);
  const [remaining, setRemaining] = useState(params.roundMs);
  const [fb, setFb] = useState<{ text: string; ok: boolean; id: number } | null>(null);
  const results = useRef<ScanRoundResult[]>([]);
  const markedRef = useRef<number[]>([]);
  const roundStart = useRef(0);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const round = rounds[index];

  useEffect(() => {
    startedAt.current = Date.now();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const finishRound = () => {
    if (phase !== 'search') return;
    const r = scoreScanRound(round.targetCells, markedRef.current);
    results.current.push(r);
    const ok = r.hits === r.targets && r.falseMarks === 0;
    setFb({ text: t('exercises.scanResult', { hits: r.hits, total: r.targets, wrong: r.falseMarks }), ok, id: index });
    setPhase('done');
    const last = index + 1 >= rounds.length;
    timer.current = setTimeout(() => {
      setFb(null);
      if (last) {
        const s = summarizeScan(results.current);
        onFinish({ score: s.score, accuracy: s.accuracy, avgResponseMs: null, durationMs: Date.now() - startedAt.current });
      } else {
        markedRef.current = [];
        setMarked([]);
        setIndex(index + 1);
        setPhase('ready');
        setRemaining(params.roundMs);
      }
    }, FEEDBACK_MS + 500);
  };

  // Tur süresi: kalan süreyi güncelle; süre dolunca turu otomatik bitir.
  useEffect(() => {
    if (phase !== 'search') return;
    const id = setInterval(() => {
      const left = Math.max(0, params.roundMs - (Date.now() - roundStart.current));
      setRemaining(left);
      if (left === 0) clearInterval(id);
    }, 100);
    const end = setTimeout(() => {
      clearInterval(id);
      finishRound();
    }, params.roundMs);
    return () => {
      clearInterval(id);
      clearTimeout(end);
    };
    // finishRound her render'da yeniden oluşur; döngü yalnızca tur değişince yeniden kurulmalı.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, params.roundMs]);

  const toggle = (cell: number) => {
    if (phase !== 'search') return;
    const next = markedRef.current.includes(cell)
      ? markedRef.current.filter((c) => c !== cell)
      : [...markedRef.current, cell];
    markedRef.current = next;
    setMarked(next);
  };

  const cell = size / GRID_COLS;
  const secLeft = Math.ceil(remaining / 1000);

  return (
    <View style={{ gap: spacing.lg }}>
      <RoundHud done={index} total={rounds.length} color={color} label={t('exercises.round', { current: index + 1, total: rounds.length })} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: color + '1A' }}>
          <Text_ variant="label">{t('exercises.scanTarget')}</Text_>
          <Text_ style={{ fontSize: scale(20), fontWeight: '900', color }}>{round.target}</Text_>
        </View>
        {phase === 'search' && (
          <Text_ variant="label" style={{ color }}>{t('exercises.timeLeft', { value: secLeft })}</Text_>
        )}
      </View>

      <Stage size={size} color={color}>
        {phase === 'ready' && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="search-outline" size={56} color={color} />
          </View>
        )}
        {(phase === 'search' || phase === 'done') &&
          round.grid.map((letter, i) => {
            const col = i % GRID_COLS;
            const row = Math.floor(i / GRID_COLS);
            const on = marked.includes(i);
            return (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={`${letter}${on ? ', işaretli' : ''}`}
                onPress={() => toggle(i)}
                style={{
                  position: 'absolute',
                  left: col * cell + 3,
                  top: row * cell + 3,
                  width: cell - 6,
                  height: cell - 6,
                  borderRadius: radius.sm,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: on ? color : colors.surfaceAlt,
                }}
              >
                <Text_ style={{ fontSize: scale(20), fontWeight: '700', color: on ? '#FFFFFF' : colors.text }}>{letter}</Text_>
              </Pressable>
            );
          })}
      </Stage>

      {phase === 'ready' && (
        <Card>
          <ReadyPanel
            icon="search-outline"
            color={color}
            title={t('exercises.scanReadyTitle')}
            body={t('exercises.scanReadyBody', { target: round.target })}
            cta={t('exercises.ready')}
            onStart={() => {
              markedRef.current = [];
              setMarked([]);
              roundStart.current = Date.now();
              setRemaining(params.roundMs);
              setPhase('search');
            }}
          />
        </Card>
      )}

      {phase === 'search' && (
        <Button title={t('exercises.scanFinish')} onPress={finishRound} style={{ backgroundColor: color }} />
      )}

      <Feedback ok={fb ? fb.ok : null} id={fb?.id ?? -1} text={fb ? fb.text : ''} />
    </View>
  );
}

/* ───────────────────────── Hızlı Göz Gezdirme ───────────────────────── */
export function SkimGame({ settings, onFinish }: GameProps) {
  const { colors } = useTheme();
  const color = EXERCISES.skim_read.color;
  const params = useMemo(() => skimParams(settings.difficulty, settings.speedMs), [settings.difficulty, settings.speedMs]);
  const [text, setText] = useState<BuiltinText | null>(null);
  const [phase, setPhase] = useState<'ready' | 'read' | 'quiz'>('ready');
  const [qi, setQi] = useState(0);
  const [selections, setSelections] = useState<(number | null)[]>([]);
  const [remaining, setRemaining] = useState(params.showMs);
  const startedAt = useRef(0);
  const readStart = useRef(0);

  // Seçim yalnızca hazır paneli açıldığında yapılır (render'da rastgelelik yok).
  const pick = () => {
    const t0 = pickSkimText(settings.difficulty, createRng(seed()));
    setText(t0);
    setSelections(t0.questions.map(() => null));
    setQi(0);
    startedAt.current = Date.now();
    readStart.current = Date.now();
    setRemaining(params.showMs);
    setPhase('read');
  };

  useEffect(() => {
    if (phase !== 'read') return;
    const id = setInterval(() => {
      const left = Math.max(0, params.showMs - (Date.now() - readStart.current));
      setRemaining(left);
    }, 100);
    const end = setTimeout(() => {
      clearInterval(id);
      setPhase('quiz');
    }, params.showMs);
    return () => {
      clearInterval(id);
      clearTimeout(end);
    };
  }, [phase, params.showMs]);

  if (phase === 'ready' || !text) {
    return (
      <Card>
        <ReadyPanel icon="reader-outline" color={color} title={t('exercises.skimReadyTitle')} body={t('exercises.skimReadyBody')} cta={t('exercises.ready')} onStart={pick} />
      </Card>
    );
  }

  if (phase === 'read') {
    const pct = Math.round((1 - remaining / params.showMs) * 100);
    return (
      <View style={{ gap: spacing.md }}>
        <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
          <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color }} />
        </View>
        <Text_ variant="caption" muted style={{ textAlign: 'center' }}>{t('exercises.timeLeft', { value: Math.ceil(remaining / 1000) })}</Text_>
        <Card>
          <Text_ variant="heading" style={{ marginBottom: spacing.sm }}>{text.title}</Text_>
          <Text_ style={{ lineHeight: 26 }}>{text.body}</Text_>
        </Card>
        <Button title={t('exercises.skimToQuiz')} variant="secondary" onPress={() => setPhase('quiz')} />
      </View>
    );
  }

  const q = text.questions[qi];
  const sel = selections[qi];
  const last = qi === text.questions.length - 1;
  const finish = () => {
    const correct = text.questions.reduce((n, qq, i) => n + (selections[i] === qq.correctIndex ? 1 : 0), 0);
    const s = summarizeSkim(correct, text.questions.length);
    onFinish({ score: s.score, accuracy: s.accuracy, avgResponseMs: null, durationMs: Date.now() - startedAt.current });
  };

  return (
    <View style={{ gap: spacing.lg }}>
      <Text_ variant="caption" muted>{t('exercises.round', { current: qi + 1, total: text.questions.length })}</Text_>
      <Card style={{ gap: spacing.md }}>
        <Text_ variant="heading">{q.question}</Text_>
        {q.options.map((opt, i) => (
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityState={{ selected: sel === i }}
            accessibilityLabel={opt}
            onPress={() => setSelections((prev) => prev.map((v, j) => (j === qi ? i : v)))}
            style={{ minHeight: 52, borderRadius: radius.md, justifyContent: 'center', paddingHorizontal: spacing.md, backgroundColor: sel === i ? color : colors.surfaceAlt, borderWidth: 1, borderColor: sel === i ? color : colors.border }}
          >
            <Text_ style={{ color: sel === i ? '#FFFFFF' : colors.text, fontWeight: '600' }}>{opt}</Text_>
          </Pressable>
        ))}
      </Card>
      <Button
        title={last ? t('common.finish') : t('common.next')}
        disabled={sel === null || sel === undefined}
        style={{ backgroundColor: color }}
        onPress={() => (last ? finish() : setQi(qi + 1))}
      />
    </View>
  );
}
