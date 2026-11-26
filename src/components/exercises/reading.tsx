/** Okuma teknikleri oyunları: Hızlı Tarama, Satır Tarama, Göz Gezdirme, Eş Anlam. */
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text_ } from '../ui';
import { Choices, FEEDBACK_MS, GameProps, GameShell, Hint, Verdict, elapsedSince, newSeed, nowMs, useDelay } from './shell';
import { EXERCISES } from '../../core/exercises/registry';
import { GRID_COLS, ScanRoundResult, generateScanRound, scanParams, scoreScanRound, summarizeScan } from '../../core/exercises/scanSearch';
import { generateLineScanRound, lineScanParams, summarizeLineScan } from '../../core/exercises/lineScan';
import { pickSkimText, skimParams, summarizeSkim } from '../../core/exercises/skim';
import { generateSynonymSet, summarizeSynonyms, synonymParams } from '../../core/exercises/synonyms';
import { createRng } from '../../core/rng';
import { haptic } from '../../services/haptics';
import { radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';

/** `running` iken kalan süreyi (ms) döner; bitince `onEnd` bir kez çağrılır. */
function useCountdown(running: boolean, totalMs: number, token: unknown, onEnd: () => void) {
  const [left, setLeft] = useState(totalMs);
  const endRef = useRef(onEnd);
  useEffect(() => {
    endRef.current = onEnd;
  });
  useEffect(() => {
    if (!running) return;
    const start = nowMs();
    const id = setInterval(() => {
      const rest = Math.max(0, totalMs - elapsedSince(start));
      setLeft(rest);
      if (rest === 0) {
        clearInterval(id);
        endRef.current();
      }
    }, 100);
    return () => clearInterval(id);
  }, [running, totalMs, token]);
  return left;
}

export function ScanSearchGame({ settings, onFinish, onQuit }: GameProps) {
  const { colors } = useTheme();
  const meta = EXERCISES.scan_search;
  const [params] = useState(() => scanParams(settings.difficulty, settings.speedMs));
  const [rounds] = useState(() => {
    const rng = createRng(newSeed());
    return Array.from({ length: params.rounds }, (_, i) => generateScanRound(params, i, rng));
  });
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'cue' | 'search' | 'feedback'>('cue');
  const [marked, setMarked] = useState<number[]>([]);
  const [last, setLast] = useState<ScanRoundResult | null>(null);
  const results = useRef<ScanRoundResult[]>([]);
  const startedAt = useRef(0);
  const round = rounds[index];

  const finishRound = () => {
    if (phase !== 'search') return;
    const r = scoreScanRound(round.targetCells, marked);
    results.current.push(r);
    setLast(r);
    setPhase('feedback');
    haptic(r.hits === r.targets && r.falseMarks === 0 ? 'success' : 'error');
  };
  const left = useCountdown(phase === 'search', params.roundMs, index, finishRound);
  useDelay(phase === 'cue', 1500, () => {
    if (!startedAt.current) startedAt.current = nowMs();
    setPhase('search');
  }, index);
  useDelay(phase === 'feedback', FEEDBACK_MS + 800, () => {
    if (index + 1 >= rounds.length) {
      const s = summarizeScan(results.current);
      onFinish({ score: s.score, accuracy: s.accuracy, avgResponseMs: null, durationMs: elapsedSince(startedAt.current) });
      return;
    }
    setMarked([]);
    setIndex(index + 1);
    setPhase('cue');
  }, index);

  return (
    <GameShell
      title={meta.name}
      subtitle={t('exercises.round', { current: index + 1, total: rounds.length })}
      color={meta.color}
      progress={(index + (phase === 'feedback' ? 1 : 0)) / rounds.length}
      badge={phase === 'search' ? `${Math.ceil(left / 1000)} sn` : undefined}
      onQuit={onQuit}
      footer={
        phase === 'search' ? (
          <Button title={t('exercises.scanFinish')} onPress={finishRound} />
        ) : phase === 'feedback' && last ? (
          <Verdict ok={last.hits === last.targets && last.falseMarks === 0} text={t('exercises.scanResult', { hits: last.hits, total: last.targets, wrong: last.falseMarks })} />
        ) : (
          <Hint text={t('exercises.scanReadyBody', { target: round.target })} />
        )
      }
    >
      {({ size }) => {
        const cell = Math.floor((size - 6 * (GRID_COLS - 1)) / GRID_COLS);
        return (
          <View style={{ alignItems: 'center', gap: spacing.md }}>
            {phase === 'cue' ? (
              <>
                <Text_ variant="heading">{t('exercises.scanTarget')}</Text_>
                <Text_ allowFontScaling={false} style={{ fontSize: 96, lineHeight: 112, fontWeight: '800', color: meta.color }}>{round.target}</Text_>
              </>
            ) : (
              <>
                <Text_ variant="heading">{`${t('exercises.scanTarget')}: ${round.target}`}</Text_>
                <View style={{ width: cell * GRID_COLS + 6 * (GRID_COLS - 1), flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {round.grid.map((letter, i) => {
                    const on = marked.includes(i);
                    const target = phase === 'feedback' && round.targetCells.includes(i);
                    const wrong = phase === 'feedback' && on && !target;
                    const background = target ? (on ? colors.success : colors.warning) : wrong ? colors.danger : on ? meta.color : colors.surface;
                    const filled = on || target;
                    return (
                      <Pressable
                        key={i}
                        accessibilityRole="button"
                        accessibilityState={{ selected: on }}
                        accessibilityLabel={letter}
                        disabled={phase !== 'search'}
                        onPress={() => setMarked((m) => (m.includes(i) ? m.filter((x) => x !== i) : [...m, i]))}
                        style={{ width: cell, height: cell * 0.95, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: background, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border }}
                      >
                        <Text_ allowFontScaling={false} style={{ fontSize: cell * 0.42, lineHeight: cell * 0.6, fontWeight: '700', color: filled ? '#FFFFFF' : colors.text }}>{letter}</Text_>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        );
      }}
    </GameShell>
  );
}

export function LineScanGame({ settings, onFinish, onQuit }: GameProps) {
  const { colors } = useTheme();
  const meta = EXERCISES.line_scan;
  const [rounds] = useState(() => {
    const params = lineScanParams(settings.difficulty);
    const rng = createRng(newSeed());
    return Array.from({ length: params.rounds }, (_, i) => generateLineScanRound(params, i, rng));
  });
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'cue' | 'scan' | 'feedback'>('cue');
  const [picked, setPicked] = useState<number | null>(null);
  const answers = useRef<(number | null)[]>([]);
  const times = useRef<(number | null)[]>([]);
  const shownAt = useRef(0);
  const startedAt = useRef(0);
  const round = rounds[index];

  useDelay(phase === 'cue', 1800, () => {
    if (!startedAt.current) startedAt.current = nowMs();
    shownAt.current = nowMs();
    setPhase('scan');
  }, index);
  useDelay(phase === 'feedback', FEEDBACK_MS, () => {
    if (index + 1 >= rounds.length) {
      const s = summarizeLineScan(rounds, answers.current, times.current);
      onFinish({ score: s.score, accuracy: s.accuracy, avgResponseMs: s.avgResponseMs, durationMs: elapsedSince(startedAt.current) });
      return;
    }
    setPicked(null);
    setIndex(index + 1);
    setPhase('cue');
  }, index);

  const pick = (line: number) => {
    answers.current.push(line);
    times.current.push(elapsedSince(shownAt.current));
    setPicked(line);
    setPhase('feedback');
    haptic(line === round.targetLine ? 'success' : 'error');
  };

  return (
    <GameShell
      title={meta.name}
      subtitle={t('exercises.round', { current: index + 1, total: rounds.length })}
      color={meta.color}
      progress={(index + (phase === 'feedback' ? 1 : 0)) / rounds.length}
      onQuit={onQuit}
      footer={phase === 'feedback' ? <Verdict ok={picked === round.targetLine} text={picked === round.targetLine ? t('exercises.correctMsg') : t('exercises.lineWas', { value: round.targetLine + 1 })} /> : <Hint text={t('exercises.lineScanAsk')} />}
    >
      {({ height }) =>
        phase === 'cue' ? (
          <View style={{ alignItems: 'center', gap: spacing.md }}>
            <Text_ muted>{t('exercises.findWord')}</Text_>
            <Text_ variant="display" style={{ color: meta.color }}>{round.targetWord}</Text_>
          </View>
        ) : (
          <View style={{ alignSelf: 'stretch', height, gap: spacing.sm }}>
            <Text_ variant="heading" style={{ textAlign: 'center', color: meta.color }}>{round.targetWord}</Text_>
            <ScrollView contentContainerStyle={{ gap: spacing.sm }}>
              {round.lines.map((line, i) => {
                const right = phase === 'feedback' && i === round.targetLine;
                const wrong = phase === 'feedback' && i === picked && !right;
                const edge = right ? colors.success : wrong ? colors.danger : colors.border;
                return (
                  <Pressable
                    key={`${index}-${i}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${i + 1}. ${line}`}
                    disabled={phase !== 'scan'}
                    onPress={() => pick(i)}
                    style={({ pressed }) => ({ flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: right || wrong ? 2 : StyleSheet.hairlineWidth, borderColor: edge, backgroundColor: right ? colors.success + '1C' : wrong ? colors.danger + '1C' : pressed ? colors.surfaceAlt : colors.surface })}
                  >
                    <Text_ variant="label" muted>{String(i + 1)}</Text_>
                    <Text_ style={{ flex: 1 }}>{line}</Text_>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )
      }
    </GameShell>
  );
}

export function SkimGame({ settings, onFinish, onQuit }: GameProps) {
  const { colors } = useTheme();
  const meta = EXERCISES.skim_read;
  const [params] = useState(() => skimParams(settings.difficulty, settings.speedMs));
  const [text] = useState(() => pickSkimText(settings.difficulty, createRng(newSeed())));
  const [phase, setPhase] = useState<'cue' | 'read' | 'quiz'>('cue');
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const correct = useRef(0);
  const startedAt = useRef(0);
  const total = text.questions.length;

  useDelay(phase === 'cue', 2000, () => {
    startedAt.current = nowMs();
    setPhase('read');
  });
  const left = useCountdown(phase === 'read', params.showMs, 0, () => setPhase('quiz'));
  useDelay(picked !== null, FEEDBACK_MS, () => {
    if (qi + 1 >= total) {
      const s = summarizeSkim(correct.current, total);
      onFinish({ score: s.score, accuracy: s.accuracy, avgResponseMs: null, durationMs: elapsedSince(startedAt.current) });
      return;
    }
    setPicked(null);
    setQi(qi + 1);
  }, qi);

  const q = text.questions[qi];
  const pick = (i: number) => {
    if (i === q.correctIndex) correct.current++;
    setPicked(i);
    haptic(i === q.correctIndex ? 'success' : 'error');
  };

  return (
    <GameShell
      title={meta.name}
      subtitle={phase === 'quiz' ? t('exercises.questionN', { current: qi + 1, total }) : undefined}
      color={meta.color}
      progress={phase === 'quiz' ? (qi + (picked !== null ? 1 : 0)) / total : phase === 'read' ? 1 - left / params.showMs : 0}
      badge={phase === 'read' ? `${Math.ceil(left / 1000)} sn` : undefined}
      onQuit={onQuit}
      footer={phase === 'read' ? <Button title={t('exercises.skimToQuiz')} variant="secondary" onPress={() => setPhase('quiz')} /> : phase === 'cue' ? <Hint text={t('exercises.skimReadyBody')} /> : null}
    >
      {({ height }) =>
        phase === 'cue' ? (
          <View style={{ alignItems: 'center', gap: spacing.sm }}>
            <Text_ muted>{t('exercises.getReady')}</Text_>
            <Text_ variant="title" style={{ textAlign: 'center' }}>{text.title}</Text_>
          </View>
        ) : (
          <ScrollView style={{ alignSelf: 'stretch', height }} contentContainerStyle={{ gap: spacing.md, flexGrow: 1, justifyContent: 'center' }}>
            {phase === 'read' ? (
              <View style={{ padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, gap: spacing.sm }}>
                <Text_ variant="heading">{text.title}</Text_>
                <Text_ style={{ lineHeight: 28 }}>{text.body}</Text_>
              </View>
            ) : (
              <>
                <Text_ variant="heading" style={{ textAlign: 'center' }}>{q.question}</Text_>
                <Choices options={q.options} correct={q.correctIndex} picked={picked} onPick={pick} />
              </>
            )}
          </ScrollView>
        )
      }
    </GameShell>
  );
}

export function SynonymGame({ settings, onFinish, onQuit }: GameProps) {
  const { colors } = useTheme();
  const meta = EXERCISES.synonym_match;
  const [rounds] = useState(() => generateSynonymSet(synonymParams(settings.difficulty).rounds, createRng(newSeed())));
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const answers = useRef<(number | null)[]>([]);
  const times = useRef<(number | null)[]>([]);
  const shownAt = useRef(0);
  const startedAt = useRef(0);
  const round = rounds[index];

  useDelay(!started, 1800, () => {
    startedAt.current = nowMs();
    shownAt.current = nowMs();
    setStarted(true);
  });
  useDelay(picked !== null, FEEDBACK_MS, () => {
    if (index + 1 >= rounds.length) {
      const s = summarizeSynonyms(rounds, answers.current, times.current);
      onFinish({ score: s.score, accuracy: s.accuracy, avgResponseMs: s.avgResponseMs, durationMs: elapsedSince(startedAt.current) });
      return;
    }
    shownAt.current = nowMs();
    setPicked(null);
    setIndex(index + 1);
  }, index);

  const pick = (i: number) => {
    answers.current.push(i);
    times.current.push(elapsedSince(shownAt.current));
    setPicked(i);
    haptic(i === round.correctIndex ? 'success' : 'error');
  };

  return (
    <GameShell
      title={meta.name}
      subtitle={t('exercises.round', { current: index + 1, total: rounds.length })}
      color={meta.color}
      progress={(index + (picked !== null ? 1 : 0)) / rounds.length}
      onQuit={onQuit}
      footer={started ? null : <Hint text={t('exercises.synonymReadyBody')} />}
    >
      {() =>
        !started ? (
          <Text_ variant="title" style={{ textAlign: 'center' }}>{t('exercises.getReady')}</Text_>
        ) : (
          <View style={{ alignSelf: 'stretch', gap: spacing.lg }}>
            <View style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl, borderRadius: radius.lg, backgroundColor: colors.surface }}>
              <Text_ variant="caption" muted>{t('exercises.synonymAsk')}</Text_>
              <Text_ variant="display" style={{ color: meta.color }}>{round.word}</Text_>
            </View>
            <Choices key={index} options={round.options} correct={round.correctIndex} picked={picked} onPick={pick} />
          </View>
        )
      }
    </GameShell>
  );
}
