/** Ek egzersizler: Rehberli Satır, Sütun Akışı, Farklıyı Bul, Kare Hafızası, Cümle Sıralama. */
import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Button, Text_ } from '../ui';
import { Board, Choices, FEEDBACK_MS, GameProps, GameShell, Hint, Verdict, elapsedSince, newSeed, nowMs, useDelay } from './shell';
import { EXERCISES } from '../../core/exercises/registry';
import type { ExerciseKey } from '../../core/exercises/types';
import { columnFlow, CORSI_COLS, corsiRounds, oddOneRounds, orderScore, pacerText, sentenceOrderRounds } from '../../core/exercises/moreGames';
import { summarizeGame } from '../../core/exercises/wordGames';
import { createRng } from '../../core/rng';
import { haptic } from '../../services/haptics';
import { radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';

const rng = () => createRng(newSeed());
const head = (key: ExerciseKey, progress: number, subtitle?: string) => ({ title: EXERCISES[key].name, color: EXERCISES[key].color, progress, subtitle });

/** Oyunun başlangıç anını ilk karede kaydeder. */
function useStartedAt() {
  const startedAt = useRef(0);
  useDelay(true, 0, () => {
    startedAt.current = nowMs();
  });
  return startedAt;
}

export function PacerGame({ settings, onFinish, onQuit }: GameProps) {
  const { colors } = useTheme();
  const [text] = useState(() => pacerText(settings.difficulty, rng()));
  const [line, setLine] = useState(0);
  const [question, setQuestion] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const correct = useRef(0);
  const startedAt = useStartedAt();
  const reading = line < text.lines.length;

  useDelay(reading, text.lines[line]?.ms ?? 0, () => setLine(line + 1), line);
  useDelay(picked !== null, FEEDBACK_MS, () => {
    if (question + 1 >= text.questions.length) {
      onFinish({ ...summarizeGame(correct.current, text.questions.length), durationMs: elapsedSince(startedAt.current) });
      return;
    }
    setQuestion(question + 1);
    setPicked(null);
  }, question);

  const q = text.questions[question];
  return (
    <GameShell
      {...head('pacer_read', reading ? line / text.lines.length : 1, reading ? t('common.wpm', { value: text.wpm }) : t('exercises.round', { current: question + 1, total: text.questions.length }))}
      onQuit={onQuit}
      footer={<Hint text={t(reading ? 'games.pacer_read' : 'games.pacerQuestion')} />}
    >
      {({ width, height }) => (
        <View style={{ width, height }}>
          {reading ? (
            <View style={{ flex: 1, justifyContent: 'center' }}>
              {/* Vurgulanan satır ortada kalır. */}
              {[-2, -1, 0, 1, 2].map((offset) => (
                <Text_ key={offset} variant="heading" muted={offset !== 0} numberOfLines={2} style={{ textAlign: 'center', paddingVertical: spacing.sm, borderRadius: radius.sm, backgroundColor: offset === 0 ? EXERCISES.pacer_read.color + '26' : 'transparent', opacity: offset === 0 ? 1 : 0.55 }}>
                  {text.lines[line + offset]?.text ?? ' '}
                </Text_>
              ))}
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: spacing.lg }}>
              <Text_ variant="heading" style={{ textAlign: 'center', color: colors.text }}>{q.question}</Text_>
              <Choices
                options={q.options}
                correct={q.correctIndex}
                picked={picked}
                onPick={(i) => {
                  haptic(i === q.correctIndex ? 'success' : 'error');
                  if (i === q.correctIndex) correct.current++;
                  setPicked(i);
                }}
              />
            </ScrollView>
          )}
        </View>
      )}
    </GameShell>
  );
}

export function ColumnFlowGame({ settings, onFinish, onQuit }: GameProps) {
  const { colors } = useTheme();
  const [items] = useState(() => columnFlow(settings.difficulty, rng()));
  const [index, setIndex] = useState(0);
  const [tapped, setTapped] = useState(false);
  const stats = useRef({ hits: 0, falseTaps: 0 });
  const startedAt = useStartedAt();
  const item = items[index];

  useDelay(true, Math.max(450, settings.speedMs - settings.difficulty * 90), () => {
    if (index + 1 >= items.length) {
      const targets = items.filter((i) => i.target).length;
      onFinish({ ...summarizeGame(Math.max(0, stats.current.hits - stats.current.falseTaps), targets), durationMs: elapsedSince(startedAt.current) });
      return;
    }
    setTapped(false);
    setIndex(index + 1);
  }, index);

  const tap = () => {
    if (tapped) return;
    haptic(item.target ? 'success' : 'error');
    if (item.target) stats.current.hits++;
    else stats.current.falseTaps++;
    setTapped(true);
  };

  return (
    <GameShell {...head('column_flow', index / items.length, `${index + 1}/${items.length}`)} onQuit={onQuit} footer={<Hint text={t('games.column_flow')} />}>
      {({ size }) => (
        <Board size={size} onPress={tap} label={t('games.column_flow')}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            {[0, 1].map((column) => (
              <View key={column} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderLeftWidth: column, borderLeftColor: colors.border }}>
                {item.column === column ? (
                  <Text_ variant="title" style={{ color: tapped ? (item.target ? colors.success : colors.danger) : colors.text }}>{item.word}</Text_>
                ) : null}
              </View>
            ))}
          </View>
        </Board>
      )}
    </GameShell>
  );
}

export function OddOneGame({ settings, onFinish, onQuit }: GameProps) {
  const { colors } = useTheme();
  const [rounds] = useState(() => oddOneRounds(settings.difficulty, rng()));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const stats = useRef({ correct: 0, times: [] as number[], shownAt: 0 });
  const startedAt = useStartedAt();
  const round = rounds[index];

  useDelay(true, 0, () => {
    stats.current.shownAt = nowMs();
  });
  useDelay(picked !== null, FEEDBACK_MS, () => {
    if (index + 1 >= rounds.length) {
      onFinish({ ...summarizeGame(stats.current.correct, rounds.length, stats.current.times), durationMs: elapsedSince(startedAt.current) });
      return;
    }
    stats.current.shownAt = nowMs();
    setPicked(null);
    setIndex(index + 1);
  }, index);

  const pick = (i: number) => {
    const ok = i === round.oddIndex;
    haptic(ok ? 'success' : 'error');
    if (ok) {
      stats.current.correct++;
      stats.current.times.push(elapsedSince(stats.current.shownAt));
    }
    setPicked(i);
  };
  useDelay(picked === null, round.limitMs, () => pick(-1), index);

  return (
    <GameShell
      {...head('odd_one', (index + (picked === null ? 0 : 1)) / rounds.length, t('exercises.round', { current: index + 1, total: rounds.length }))}
      onQuit={onQuit}
      footer={picked === null ? <Hint text={t('games.odd_one')} /> : <Verdict ok={picked === round.oddIndex} text={t(picked === round.oddIndex ? 'exercises.correctMsg' : 'exercises.wrongMsg')} />}
    >
      {({ size }) => (
        <View style={{ width: size, flexDirection: 'row', flexWrap: 'wrap' }}>
          {round.cells.map((cell, i) => (
            <Pressable key={`${index}-${i}`} accessibilityRole="button" accessibilityLabel={cell} disabled={picked !== null} onPress={() => pick(i)} style={{ width: Math.floor(size / round.cols), height: Math.floor(size / round.cols), alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: picked !== null && i === round.oddIndex ? colors.success + '40' : picked === i ? colors.danger + '40' : 'transparent' }}>
              <Text_ variant="title">{cell}</Text_>
            </Pressable>
          ))}
        </View>
      )}
    </GameShell>
  );
}

export function CorsiGame({ settings, onFinish, onQuit }: GameProps) {
  const { colors } = useTheme();
  const color = EXERCISES.corsi.color;
  const [rounds] = useState(() => corsiRounds(settings.difficulty, rng()));
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [lit, setLit] = useState(false);
  const [picked, setPicked] = useState<number[]>([]);
  const correct = useRef(0);
  const startedAt = useStartedAt();
  const sequence = rounds[index];
  const showing = step < sequence.length;
  const done = picked.length === sequence.length;
  const hits = picked.filter((c, i) => c === sequence[i]).length;

  // Her kare önce söner, sonra yanar; aynı ritim sırayı ayırt etmeyi sağlar.
  useDelay(showing && !lit, 300, () => setLit(true), `${index}-${step}`);
  useDelay(showing && lit, settings.speedMs, () => {
    setLit(false);
    setStep(step + 1);
  }, `${index}-${step}`);
  useDelay(done, FEEDBACK_MS, () => {
    if (index + 1 >= rounds.length) {
      onFinish({ ...summarizeGame(correct.current, rounds.length * sequence.length), durationMs: elapsedSince(startedAt.current) });
      return;
    }
    setIndex(index + 1);
    setStep(0);
    setPicked([]);
  }, index);

  const pick = (cell: number) => {
    if (showing || done || picked.includes(cell)) return;
    haptic('light');
    if (cell === sequence[picked.length]) correct.current++;
    setPicked([...picked, cell]);
  };

  return (
    <GameShell
      {...head('corsi', index / rounds.length, t('exercises.round', { current: index + 1, total: rounds.length }))}
      onQuit={onQuit}
      footer={done ? <Verdict ok={hits === sequence.length} text={t('games.corsiScore', { correct: hits, total: sequence.length })} /> : <Hint text={t(showing ? 'games.corsiWatch' : 'games.corsi')} />}
    >
      {({ size }) => (
        <View style={{ width: size, flexDirection: 'row', flexWrap: 'wrap' }}>
          {Array.from({ length: CORSI_COLS * CORSI_COLS }, (_, i) => {
            const on = (showing && lit && sequence[step] === i) || picked.includes(i);
            return (
              <Pressable key={i} accessibilityRole="button" accessibilityLabel={`${i + 1}`} onPress={() => pick(i)} style={{ width: Math.floor(size / CORSI_COLS), height: Math.floor(size / CORSI_COLS), padding: 4 }}>
                <View style={{ flex: 1, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? color : colors.surfaceAlt }}>
                  {picked.includes(i) ? <Text_ variant="heading" style={{ color: '#FFFFFF' }}>{String(picked.indexOf(i) + 1)}</Text_> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </GameShell>
  );
}

export function SentenceOrderGame({ settings, onFinish, onQuit }: GameProps) {
  const { colors } = useTheme();
  const color = EXERCISES.sentence_order.color;
  const [rounds] = useState(() => sentenceOrderRounds(settings.difficulty, rng()));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const correct = useRef(0);
  const startedAt = useStartedAt();
  const round = rounds[index];
  const hits = orderScore(round, picked);

  useDelay(checked, FEEDBACK_MS * 3, () => {
    if (index + 1 >= rounds.length) {
      onFinish({ ...summarizeGame(correct.current, rounds.reduce((s, r) => s + r.correct.length, 0)), durationMs: elapsedSince(startedAt.current) });
      return;
    }
    setIndex(index + 1);
    setPicked([]);
    setChecked(false);
  }, index);

  return (
    <GameShell
      {...head('sentence_order', (index + (checked ? 1 : 0)) / rounds.length, t('exercises.round', { current: index + 1, total: rounds.length }))}
      onQuit={onQuit}
      footer={
        checked ? (
          <Verdict ok={hits === round.correct.length} text={t('games.orderScore', { correct: hits, total: round.correct.length })} />
        ) : (
          <Button
            title={t('games.check', { selected: picked.length, total: round.correct.length })}
            disabled={picked.length !== round.correct.length}
            onPress={() => {
              correct.current += hits;
              haptic(hits === round.correct.length ? 'success' : 'error');
              setChecked(true);
            }}
          />
        )
      }
    >
      {({ width, height }) => (
        <ScrollView style={{ width, height }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: spacing.sm }}>
          <Hint text={t('games.sentence_order')} />
          {round.shuffled.map((sentence) => {
            const at = picked.indexOf(sentence);
            const right = round.correct.indexOf(sentence);
            return (
              <Pressable
                key={sentence}
                accessibilityRole="button"
                accessibilityState={{ selected: at >= 0 }}
                disabled={checked}
                onPress={() => setPicked((p) => (at >= 0 ? p.filter((x) => x !== sentence) : [...p, sentence]))}
                style={{ flexDirection: 'row', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: at >= 0 ? 2 : 1, borderColor: checked ? (at === right ? colors.success : colors.danger) : at >= 0 ? color : colors.border, backgroundColor: colors.surface }}
              >
                <Text_ variant="heading" style={{ width: 22, color }}>{checked ? String(right + 1) : at >= 0 ? String(at + 1) : '·'}</Text_>
                <Text_ style={{ flex: 1 }}>{sentence}</Text_>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </GameShell>
  );
}
