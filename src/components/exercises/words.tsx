/** Kelime oyunları: seçmeli turlar, hatalı kelime, kelime hafızası ve kelime avı. */
import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Button, Chip, Text_ } from '../ui';
import { Board, Center, Choices, FEEDBACK_MS, GameProps, GameShell, Hint, Verdict, elapsedSince, newSeed, nowMs, useDelay } from './shell';
import { EXERCISES } from '../../core/exercises/registry';
import type { ExerciseKey } from '../../core/exercises/types';
import {
  ChainRound, chainCorrect, ChoiceRound, huntMatch, lineCells, mazeRounds, realOrFakeRounds, trueFalseRounds, wordChainRounds, missingWordRounds, phraseRounds, sentenceFinishRounds, summarizeGame, typoRounds, wordFindRounds, wordHuntPuzzle, wordMemoryRounds,
} from '../../core/exercises/wordGames';
import { stroopRounds, mainIdeaRounds, scanAnswerRounds, antonymRounds, categoryOddRounds, connectorRounds } from '../../core/exercises/moreGames';
import { createRng, Rng } from '../../core/rng';
import { haptic } from '../../services/haptics';
import { radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';

type ChoiceKey = 'word_find' | 'phrase_group' | 'missing_word' | 'sentence_finish' | 'real_or_fake' | 'true_false' | 'maze_read' | 'stroop' | 'main_idea' | 'scan_answer' | 'antonym' | 'category_odd' | 'connector';

const CHOICE_ROUNDS: Record<ChoiceKey, (difficulty: number, rng: Rng) => ChoiceRound[]> = {
  word_find: wordFindRounds,
  phrase_group: phraseRounds,
  missing_word: missingWordRounds,
  sentence_finish: sentenceFinishRounds,
  real_or_fake: realOrFakeRounds,
  true_false: trueFalseRounds,
  maze_read: mazeRounds,
  stroop: stroopRounds,
  main_idea: mainIdeaRounds,
  scan_answer: scanAnswerRounds,
  antonym: antonymRounds,
  category_odd: categoryOddRounds,
  connector: connectorRounds,
};

const shell = (key: ExerciseKey, index: number, total: number, done: boolean) => ({
  title: EXERCISES[key].name,
  color: EXERCISES[key].color,
  subtitle: t('exercises.round', { current: index + 1, total }),
  progress: (index + (done ? 1 : 0)) / total,
});

/** Seçmeli oyunlar. `phrase_group` önce anlam öbeklerini sırayla gösterir. */
export function ChoiceGame({ gameKey, settings, onFinish, onQuit }: GameProps & { gameKey: ChoiceKey }) {
  const [rounds] = useState(() => CHOICE_ROUNDS[gameKey](settings.difficulty, createRng(newSeed())));
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const round = rounds[index];
  const flashing = round.flash !== undefined && step < round.flash.length;
  const stats = useRef({ correct: 0, times: [] as number[], startedAt: 0, shownAt: 0 });

  useDelay(true, 0, () => {
    stats.current.startedAt = nowMs();
    stats.current.shownAt = nowMs();
  });
  useDelay(flashing, settings.speedMs, () => {
    if (step + 1 >= round.flash!.length) stats.current.shownAt = nowMs();
    setStep(step + 1);
  }, `${index}-${step}`);
  useDelay(picked !== null, FEEDBACK_MS, () => {
    if (index + 1 >= rounds.length) {
      const s = stats.current;
      onFinish({ ...summarizeGame(s.correct, rounds.length, s.times), durationMs: elapsedSince(s.startedAt) });
      return;
    }
    setIndex(index + 1);
    setStep(0);
    setPicked(null);
    stats.current.shownAt = nowMs();
  }, index);

  const pick = (i: number) => {
    const ok = i === round.correctIndex;
    haptic(ok ? 'success' : 'error');
    if (ok) stats.current.correct++;
    stats.current.times.push(elapsedSince(stats.current.shownAt));
    setPicked(i);
  };

  // Süre sınırlı turlarda zaman dolarsa cevap boş (yanlış) sayılır.
  useDelay(round.limitMs !== undefined && picked === null, round.limitMs ?? 0, () => pick(-1), index);

  return (
    <GameShell
      {...shell(gameKey, index, rounds.length, picked !== null)}
      onQuit={onQuit}
      footer={picked !== null ? <Verdict ok={picked === round.correctIndex} text={picked === round.correctIndex ? t('exercises.correctMsg') : t('exercises.expectedMsg', { value: round.options[round.correctIndex] })} /> : <Hint text={t(`games.${gameKey}`)} />}
    >
      {({ width }) => (
        <ScrollView style={{ width, alignSelf: 'stretch' }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: spacing.lg }}>
          {flashing ? (
            <Text_ variant="title" accessibilityLiveRegion="polite" style={{ textAlign: 'center' }}>{round.flash![step]}</Text_>
          ) : (
            <>
              {round.prompt ? <Text_ variant={['word_find', 'real_or_fake', 'stroop', 'antonym'].includes(gameKey) ? 'display' : 'heading'} style={{ textAlign: 'center', ...(round.promptColor ? { color: round.promptColor } : null) }}>{round.prompt}</Text_> : null}
              <Choices options={round.options} correct={round.correctIndex} picked={picked} onPick={pick} />
            </>
          )}
        </ScrollView>
      )}
    </GameShell>
  );
}

export function TypoGame({ settings, onFinish, onQuit }: GameProps) {
  const { colors } = useTheme();
  const [rounds] = useState(() => typoRounds(settings.difficulty, createRng(newSeed())));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const stats = useRef({ correct: 0, times: [] as number[], startedAt: 0, shownAt: 0 });
  const round = rounds[index];

  useDelay(true, 0, () => {
    stats.current.startedAt = nowMs();
    stats.current.shownAt = nowMs();
  });
  useDelay(picked !== null, FEEDBACK_MS + 400, () => {
    if (index + 1 >= rounds.length) {
      const s = stats.current;
      onFinish({ ...summarizeGame(s.correct, rounds.length, s.times), durationMs: elapsedSince(s.startedAt) });
      return;
    }
    setIndex(index + 1);
    setPicked(null);
    stats.current.shownAt = nowMs();
  }, index);

  const pick = (i: number) => {
    const ok = i === round.wrongIndex;
    haptic(ok ? 'success' : 'error');
    if (ok) stats.current.correct++;
    stats.current.times.push(elapsedSince(stats.current.shownAt));
    setPicked(i);
  };

  return (
    <GameShell
      {...shell('typo_find', index, rounds.length, picked !== null)}
      onQuit={onQuit}
      footer={picked !== null ? <Verdict ok={picked === round.wrongIndex} text={t('games.typoAnswer', { value: round.original })} /> : <Hint text={t('games.typo_find')} />}
    >
      {({ width }) => (
        <View style={{ width, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm }}>
          {round.words.map((word, i) => {
            const tint = picked === null ? colors.border : i === round.wrongIndex ? colors.success : i === picked ? colors.danger : colors.border;
            return (
              <Pressable key={`${index}-${i}`} accessibilityRole="button" disabled={picked !== null} onPress={() => pick(i)} style={{ minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: tint === colors.border ? 1 : 2, borderColor: tint, backgroundColor: colors.surface }}>
                <Text_ variant="heading">{word}</Text_>
              </Pressable>
            );
          })}
        </View>
      )}
    </GameShell>
  );
}

export function WordMemoryGame({ settings, onFinish, onQuit }: GameProps) {
  const [rounds] = useState(() => wordMemoryRounds(settings.difficulty, createRng(newSeed())));
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'show' | 'answer' | 'feedback'>('show');
  const [selected, setSelected] = useState<string[]>([]);
  const stats = useRef({ correct: 0, startedAt: 0 });
  const round = rounds[index];
  const hits = selected.filter((w) => round.words.includes(w)).length;

  useDelay(true, 0, () => {
    stats.current.startedAt = nowMs();
  });
  // Gösterim süresi sözcük sayısıyla uzar.
  useDelay(phase === 'show', settings.speedMs * round.words.length, () => setPhase('answer'), index);
  useDelay(phase === 'feedback', FEEDBACK_MS + 1000, () => {
    if (index + 1 >= rounds.length) {
      onFinish({ ...summarizeGame(stats.current.correct, rounds.length * round.words.length), durationMs: elapsedSince(stats.current.startedAt) });
      return;
    }
    setIndex(index + 1);
    setSelected([]);
    setPhase('show');
  }, index);

  const check = () => {
    stats.current.correct += hits;
    haptic(hits === round.words.length ? 'success' : 'error');
    setPhase('feedback');
  };

  const toggle = (word: string) => {
    if (phase !== 'answer') return;
    setSelected((prev) => (prev.includes(word) ? prev.filter((w) => w !== word) : prev.length < round.words.length ? [...prev, word] : prev));
  };

  return (
    <GameShell
      {...shell('word_memory', index, rounds.length, phase === 'feedback')}
      onQuit={onQuit}
      footer={
        phase === 'answer' ? (
          <Button title={t('games.check', { selected: selected.length, total: round.words.length })} disabled={selected.length === 0} onPress={check} />
        ) : phase === 'feedback' ? (
          <Verdict ok={hits === round.words.length} text={t('games.memoryScore', { correct: hits, total: round.words.length })} />
        ) : (
          <Hint text={t('games.word_memory')} />
        )
      }
    >
      {({ width }) => (
        <View style={{ width, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm }}>
          {phase === 'show'
            ? round.words.map((w) => <Text_ key={w} variant="title" style={{ width: '45%', textAlign: 'center' }}>{w}</Text_>)
            : round.options.map((w) => (
                <Chip key={w} label={phase === 'feedback' && round.words.includes(w) ? `✓ ${w}` : w} selected={selected.includes(w)} onPress={() => toggle(w)} />
              ))}
        </View>
      )}
    </GameShell>
  );
}

export function WordHuntGame({ settings, onFinish, onQuit }: GameProps) {
  const { colors } = useTheme();
  const color = EXERCISES.word_hunt.color;
  const [puzzle] = useState(() => wordHuntPuzzle(settings.difficulty, createRng(newSeed())));
  /** Parmağın basılı olduğu sürece seçili hücreler. */
  const [path, setPath] = useState<number[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [left, setLeft] = useState(Math.round(settings.speedMs / 1000));
  const startedAt = useRef(0);
  const over = found.length === puzzle.words.length || left <= 0;

  useDelay(true, 0, () => {
    startedAt.current = nowMs();
  });
  useDelay(!over, 1000, () => setLeft(left - 1), left);
  const finish = () => onFinish({ ...summarizeGame(found.length, puzzle.words.length), durationMs: elapsedSince(startedAt.current) });
  useDelay(over, FEEDBACK_MS, finish);

  const foundCells = new Set(puzzle.words.filter((w) => found.includes(w.word)).flatMap((w) => w.cells));

  const cellAt = (x: number, y: number, cell: number) => {
    const clamp = (v: number) => Math.min(puzzle.size - 1, Math.max(0, Math.floor(v / cell)));
    return clamp(y) * puzzle.size + clamp(x);
  };

  const release = (end: number) => {
    const line = path.length > 0 ? lineCells(puzzle.size, path[0], end) : [];
    if (line.length > 1 && !over) {
      const word = huntMatch(puzzle, line[0], line[line.length - 1]);
      if (word && !found.includes(word)) {
        haptic('success');
        setFound([...found, word]);
      } else haptic('error');
    }
    setPath([]);
  };

  return (
    <GameShell
      title={EXERCISES.word_hunt.name}
      color={color}
      subtitle={t('games.huntFound', { found: found.length, total: puzzle.words.length })}
      progress={found.length / puzzle.words.length}
      badge={t('common.secondsShort', { count: Math.max(0, left) })}
      onQuit={onQuit}
      footer={
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md }}>
            {puzzle.words.map((w) => (
              <Text_ key={w.word} variant="label" muted={found.includes(w.word)} style={{ textDecorationLine: found.includes(w.word) ? 'line-through' : 'none' }}>{w.word}</Text_>
            ))}
          </View>
          <Hint text={t('games.word_hunt')} />
        </>
      }
    >
      {({ size }) => {
        // Tam sayı hücre: satırlar kaymaz ve parmağın hücresi doğru hesaplanır.
        const cell = Math.floor((size - spacing.lg) / puzzle.size);
        return (
          <Board size={size}>
            <Center>
              <View style={{ width: cell * puzzle.size, height: cell * puzzle.size, flexDirection: 'row', flexWrap: 'wrap' }}>
                {puzzle.grid.map((letter, i) => (
                  <View key={i} style={{ width: cell, height: cell, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: path.includes(i) ? color + '55' : foundCells.has(i) ? colors.success + '33' : 'transparent' }}>
                    <Text_ variant="heading">{letter}</Text_>
                  </View>
                ))}
                {/* Şeffaf katman: dokunuş hep bu görünüme geldiği için koordinatlar ızgaraya göredir. */}
                <View
                  accessible
                  accessibilityLabel={t('games.word_hunt')}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                  onStartShouldSetResponder={() => !over}
                  onMoveShouldSetResponder={() => !over}
                  onResponderTerminationRequest={() => false}
                  onResponderGrant={(e) => setPath([cellAt(e.nativeEvent.locationX, e.nativeEvent.locationY, cell)])}
                  onResponderMove={(e) => {
                    const end = cellAt(e.nativeEvent.locationX, e.nativeEvent.locationY, cell);
                    setPath((p) => (p.length === 0 ? [end] : lineCells(puzzle.size, p[0], end)));
                  }}
                  onResponderRelease={(e) => release(cellAt(e.nativeEvent.locationX, e.nativeEvent.locationY, cell))}
                  onResponderTerminate={() => setPath([])}
                />
              </View>
            </Center>
          </Board>
        );
      }}
    </GameShell>
  );
}

/** Bitişik yazılmış sözcükleri ayırma: her yeni sözcüğün ilk harfine dokunulur. */
export function WordChainGame({ settings, onFinish, onQuit }: GameProps) {
  const { colors } = useTheme();
  const color = EXERCISES.word_chain.color;
  const [rounds] = useState<ChainRound[]>(() => wordChainRounds(settings.difficulty, createRng(newSeed())));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const stats = useRef({ correct: 0, times: [] as number[], startedAt: 0, shownAt: 0 });
  const round = rounds[index];

  useDelay(true, 0, () => {
    stats.current.startedAt = nowMs();
    stats.current.shownAt = nowMs();
  });
  useDelay(checked, FEEDBACK_MS + 600, () => {
    if (index + 1 >= rounds.length) {
      const s = stats.current;
      onFinish({ ...summarizeGame(s.correct, rounds.length, s.times), durationMs: elapsedSince(s.startedAt) });
      return;
    }
    setIndex(index + 1);
    setPicked([]);
    setChecked(false);
    stats.current.shownAt = nowMs();
  }, index);

  const check = () => {
    const ok = chainCorrect(round, picked);
    haptic(ok ? 'success' : 'error');
    if (ok) stats.current.correct++;
    stats.current.times.push(elapsedSince(stats.current.shownAt));
    setChecked(true);
  };

  return (
    <GameShell
      {...shell('word_chain', index, rounds.length, checked)}
      onQuit={onQuit}
      footer={
        checked ? (
          <Verdict ok={chainCorrect(round, picked)} text={round.words.join(' · ')} />
        ) : (
          <>
            <Hint text={t('games.word_chain')} />
            <Button title={t('games.check', { selected: picked.length, total: round.starts.length })} disabled={picked.length === 0} onPress={check} />
          </>
        )
      }
    >
      {({ width }) => (
        <View style={{ width, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', rowGap: spacing.sm }}>
          {round.letters.map((letter, i) => {
            const on = picked.includes(i);
            return (
              <Pressable
                key={`${index}-${i}`}
                accessibilityRole="button"
                accessibilityLabel={letter}
                accessibilityState={{ selected: on }}
                disabled={checked || i === 0}
                onPress={() => setPicked((p) => (on ? p.filter((x) => x !== i) : [...p, i]))}
                style={{ minWidth: 30, height: 48, alignItems: 'center', justifyContent: 'center', marginLeft: on ? spacing.md : 0, borderRadius: radius.sm, backgroundColor: on ? color + '33' : colors.surface }}
              >
                <Text_ variant="title">{letter}</Text_>
              </Pressable>
            );
          })}
        </View>
      )}
    </GameShell>
  );
}
