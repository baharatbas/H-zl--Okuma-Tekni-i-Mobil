/** Görüş ve algı oyunları: Yıldız Avcısı, Flaş Sayılar, Harfleri Gör, Kelime Blokları. */
import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Text_ } from '../ui';
import { Board, Center, Choices, Counter, FEEDBACK_MS, GameProps, GameShell, Hint, Verdict, elapsedSince, newSeed, nowMs, useDelay } from './shell';
import { EXERCISES } from '../../core/exercises/registry';
import type { ExerciseKey, ExerciseResult } from '../../core/exercises/types';
import { STAR_COLORS, StarAnswer, generateStarRound, starHunterParams, summarizeStarHunter } from '../../core/exercises/starHunter';
import { checkFlashAnswer, flashParams, generateFlashRound, summarizeFlash } from '../../core/exercises/flashNumbers';
import { checkPeripheralAnswer, generatePeripheralRound, peripheralParams, summarizePeripheral } from '../../core/exercises/peripheral';
import { checkWordBlockAnswer, generateWordBlockRound, summarizeWordBlocks, wordBlockParams } from '../../core/exercises/wordBlocks';
import { createRng } from '../../core/rng';
import { haptic } from '../../services/haptics';
import { radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';

type Phase = 'cue' | 'show' | 'answer' | 'feedback';

function makeRounds<T>(count: number, make: (i: number, rng: ReturnType<typeof createRng>) => T): T[] {
  const rng = createRng(newSeed());
  return Array.from({ length: count }, (_, i) => make(i, rng));
}

/**
 * Tur tabanlı oyunların ortak akışı: hazırlık → gösterim → cevap → geri bildirim → sonraki tur.
 * Turlar kendiliğinden ilerler.
 */
function useRounds(total: number, showMs: (index: number) => number, cueMs: number, finish: () => Omit<ExerciseResult, 'durationMs'>, onFinish: (r: ExerciseResult) => void) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('cue');
  const [ok, setOk] = useState(false);
  const startedAt = useRef(0);
  const answerAt = useRef(0);

  useDelay(phase === 'cue', index === 0 ? cueMs + 600 : cueMs, () => {
    if (!startedAt.current) startedAt.current = nowMs();
    setPhase('show');
  }, index);
  useDelay(phase === 'show', showMs(index), () => {
    answerAt.current = nowMs();
    setPhase('answer');
  }, index);
  useDelay(phase === 'feedback', FEEDBACK_MS, () => {
    if (index + 1 >= total) {
      onFinish({ ...finish(), durationMs: elapsedSince(startedAt.current) });
      return;
    }
    setIndex(index + 1);
    setPhase('cue');
  }, index);

  /** Cevabı kaydeder ve geri bildirime geçer; dönen değer tepki süresidir. */
  const answer = (correct: boolean) => {
    haptic(correct ? 'success' : 'error');
    setOk(correct);
    setPhase('feedback');
    return elapsedSince(answerAt.current);
  };
  return { index, phase, ok, answer };
}

const shellProps = (key: ExerciseKey, index: number, total: number, phase: Phase) => ({
  title: EXERCISES[key].name,
  color: EXERCISES[key].color,
  subtitle: t('exercises.round', { current: index + 1, total }),
  progress: (index + (phase === 'feedback' ? 1 : 0)) / total,
});

export function StarHunterGame({ settings, onFinish, onQuit }: GameProps) {
  const { colors } = useTheme();
  const [params] = useState(() => starHunterParams(settings.difficulty, settings.speedMs));
  const [rounds] = useState(() => makeRounds(params.rounds, (i, rng) => generateStarRound(params, i, rng)));
  const [guess, setGuess] = useState(0);
  const answers = useRef<(StarAnswer | null)[]>([]);
  const game = useRounds(rounds.length, (i) => rounds[i].displayMs, 1500, () => {
    const s = summarizeStarHunter(rounds, answers.current);
    return { score: s.score, accuracy: s.accuracy, avgResponseMs: s.avgResponseMs };
  }, onFinish);
  const round = rounds[game.index];
  const target = STAR_COLORS.find((c) => c.key === round.targetColor)!;
  const color = EXERCISES.star_hunter.color;

  const submit = () => {
    const responseMs = game.answer(guess === round.targetCount);
    answers.current.push({ guess, responseMs });
  };

  return (
    <GameShell
      {...shellProps('star_hunter', game.index, rounds.length, game.phase)}
      onQuit={onQuit}
      footer={
        game.phase === 'answer' ? (
          <>
            <Counter value={guess} max={params.maxStars + 5} color={color} label={t('exercises.starAnswerTitle')} onChange={setGuess} />
            <Button title={t('exercises.submit')} onPress={() => { submit(); setGuess(0); }} />
          </>
        ) : game.phase === 'feedback' ? (
          <Verdict ok={game.ok} text={game.ok ? t('exercises.correctMsg') : t('exercises.expectedMsg', { value: round.targetCount })} />
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm, minHeight: 52 }}>
            <Ionicons name="star" size={24} color={target.hex} />
            <Text_ variant="heading">{t('exercises.targetColor', { color: target.name })}</Text_>
          </View>
        )
      }
    >
      {({ size }) => (
        <Board size={size}>
          {game.phase === 'cue' ? (
            <Center>
              <Ionicons name="star" size={72} color={target.hex} />
              <Text_ variant="title" style={{ textAlign: 'center' }}>{t('exercises.countColor', { color: target.name })}</Text_>
            </Center>
          ) : game.phase === 'show' ? (
            round.stars.map((star, i) => (
              <View key={i} style={{ position: 'absolute', left: star.x * size - size * 0.055, top: star.y * size - size * 0.055 }}>
                <Ionicons name="star" size={size * 0.11} color={STAR_COLORS.find((c) => c.key === star.color)!.hex} />
              </View>
            ))
          ) : (
            <Center>
              <Ionicons name="help-circle-outline" size={64} color={colors.textMuted} />
              <Text_ variant="heading" style={{ textAlign: 'center' }}>{t('exercises.starAnswerTitle')}</Text_>
            </Center>
          )}
        </Board>
      )}
    </GameShell>
  );
}

const PAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'];

export function FlashNumbersGame({ settings, onFinish, onQuit }: GameProps) {
  const { colors, scale } = useTheme();
  const [params] = useState(() => flashParams(settings.difficulty, settings.speedMs));
  const [rounds] = useState(() => makeRounds(params.rounds, (i, rng) => generateFlashRound(params, i, rng)));
  const [text, setText] = useState('');
  const inputs = useRef<{ input: string; responseMs: number }[]>([]);
  const game = useRounds(rounds.length, (i) => rounds[i].flashMs, 900, () => {
    const s = summarizeFlash(rounds, inputs.current);
    return { score: s.score, accuracy: s.accuracy, avgResponseMs: s.avgResponseMs };
  }, onFinish);
  const round = rounds[game.index];
  const color = EXERCISES.flash_numbers.color;
  const entering = game.phase === 'answer' || game.phase === 'feedback';

  const press = (key: string) => {
    if (key === 'del') return setText((v) => v.slice(0, -1));
    if (key === 'ok') {
      if (!text) return;
      const responseMs = game.answer(checkFlashAnswer(round, text));
      inputs.current.push({ input: text, responseMs });
      return;
    }
    setText((v) => (v.length < round.value.length ? v + key : v));
  };

  // Yeni tur başlarken önceki girişi temizle.
  const [seen, setSeen] = useState(0);
  if (seen !== game.index) {
    setSeen(game.index);
    setText('');
  }

  return (
    <GameShell
      {...shellProps('flash_numbers', game.index, rounds.length, game.phase)}
      onQuit={onQuit}
      footer={
        game.phase === 'answer' ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {PAD.map((key) => (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={key === 'del' ? t('exercises.deleteDigit') : key === 'ok' ? t('exercises.submit') : key}
                onPress={() => press(key)}
                style={({ pressed }) => ({ width: '31%', flexGrow: 1, height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: key === 'ok' ? colors.primary : pressed ? colors.surfaceAlt : colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, opacity: key === 'ok' && !text ? 0.4 : 1 })}
              >
                {key === 'del' ? <Ionicons name="backspace-outline" size={24} color={colors.text} /> : key === 'ok' ? <Ionicons name="checkmark" size={28} color={colors.onPrimary} /> : <Text_ variant="title">{key}</Text_>}
              </Pressable>
            ))}
          </View>
        ) : game.phase === 'feedback' ? (
          <Verdict ok={game.ok} text={game.ok ? t('exercises.correctMsg') : t('exercises.expectedMsg', { value: round.value })} />
        ) : (
          <Hint text={t('exercises.flashReadyBody')} />
        )
      }
    >
      {({ width, height }) => (
        <View style={{ width: Math.min(width, 420), height: Math.min(height, 240), borderRadius: radius.lg, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
          {game.phase === 'cue' ? <Text_ variant="display" muted>+</Text_> : null}
          {game.phase === 'show' ? <Text_ allowFontScaling={false} style={{ fontSize: scale(52), lineHeight: scale(62), fontWeight: '800', letterSpacing: 4 }}>{round.value}</Text_> : null}
          {entering ? (
            <>
              <Hint text={t('exercises.whatWasShown')} />
              <View accessible accessibilityLabel={text || t('exercises.whatWasShown')} style={{ flexDirection: 'row', gap: 6 }}>
                {Array.from({ length: round.value.length }, (_, i) => (
                  <View key={i} style={{ width: 36, height: 48, borderRadius: radius.sm, borderBottomWidth: 3, borderColor: color, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
                    <Text_ variant="title">{text[i] ?? ''}</Text_>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </View>
      )}
    </GameShell>
  );
}

export function PeripheralGame({ settings, onFinish, onQuit }: GameProps) {
  const { colors } = useTheme();
  const [params] = useState(() => peripheralParams(settings.difficulty, settings.speedMs));
  const [rounds] = useState(() => makeRounds(params.rounds, (i, rng) => generatePeripheralRound(params, i, rng)));
  const [guess, setGuess] = useState(0);
  const guesses = useRef<(number | null)[]>([]);
  const game = useRounds(rounds.length, (i) => rounds[i].flashMs, 1000, () => {
    const s = summarizePeripheral(rounds, guesses.current);
    return { score: s.score, accuracy: s.accuracy, avgResponseMs: null };
  }, onFinish);
  const round = rounds[game.index];
  const color = EXERCISES.peripheral_letters.color;

  const submit = () => {
    guesses.current.push(guess);
    game.answer(checkPeripheralAnswer(round, guess));
    setGuess(0);
  };

  return (
    <GameShell
      {...shellProps('peripheral_letters', game.index, rounds.length, game.phase)}
      onQuit={onQuit}
      footer={
        game.phase === 'answer' ? (
          <>
            <Counter value={guess} max={8} color={color} label={t('exercises.howManyLetters')} onChange={setGuess} />
            <Button title={t('exercises.submit')} onPress={submit} />
          </>
        ) : game.phase === 'feedback' ? (
          <Verdict ok={game.ok} text={game.ok ? t('exercises.correctMsg') : t('exercises.expectedMsg', { value: round.letters.length })} />
        ) : (
          <Hint text={t('exercises.peripheralReadyBody')} />
        )
      }
    >
      {({ size }) => {
        const bubble = size * 0.12;
        return (
          <Board size={size}>
            {game.phase === 'answer' || game.phase === 'feedback' ? (
              <Center>
                <Text_ variant="heading" style={{ textAlign: 'center' }}>{t('exercises.howManyLetters')}</Text_>
              </Center>
            ) : (
              <>
                <View style={{ position: 'absolute', left: size / 2 - 16, top: size / 2 - 16 }}>
                  <Ionicons name="add" size={32} color={colors.text} />
                </View>
                {game.phase === 'show'
                  ? round.letters.map((l, i) => (
                      <View key={i} style={{ position: 'absolute', left: (0.5 + round.radius * 0.8 * Math.cos(l.angle)) * size - bubble / 2, top: (0.5 + round.radius * 0.8 * Math.sin(l.angle)) * size - bubble / 2, width: bubble, height: bubble, borderRadius: bubble / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
                        <Text_ allowFontScaling={false} style={{ color: '#FFFFFF', fontSize: bubble * 0.5, lineHeight: bubble * 0.65, fontWeight: '800' }}>{l.letter}</Text_>
                      </View>
                    ))
                  : null}
              </>
            )}
          </Board>
        );
      }}
    </GameShell>
  );
}

export function WordBlocksGame({ settings, onFinish, onQuit }: GameProps) {
  const { colors, scale } = useTheme();
  const [params] = useState(() => wordBlockParams(settings.difficulty, settings.speedMs));
  const [rounds] = useState(() => makeRounds(params.rounds, (i, rng) => generateWordBlockRound(params, i, rng)));
  const [picked, setPicked] = useState<number | null>(null);
  const answers = useRef<(number | null)[]>([]);
  const game = useRounds(rounds.length, (i) => rounds[i].flashMs, 900, () => {
    const s = summarizeWordBlocks(rounds, answers.current);
    return { score: s.score, accuracy: s.accuracy, avgResponseMs: null };
  }, onFinish);
  const round = rounds[game.index];
  const choosing = game.phase === 'answer' || game.phase === 'feedback';
  if (!choosing && picked !== null) setPicked(null);

  const pick = (i: number) => {
    setPicked(i);
    answers.current.push(i);
    game.answer(checkWordBlockAnswer(round, i));
  };

  return (
    <GameShell {...shellProps('word_blocks', game.index, rounds.length, game.phase)} onQuit={onQuit} footer={choosing ? null : <Hint text={t('exercises.wordBlocksReadyBody')} />}>
      {({ width, height }) =>
        choosing ? (
          <View style={{ alignSelf: 'stretch', gap: spacing.md }}>
            <Text_ variant="heading" style={{ textAlign: 'center' }}>{t('exercises.wordBlocksChoose')}</Text_>
            <Choices options={round.options} correct={round.correctIndex} picked={picked} onPick={pick} />
          </View>
        ) : (
          <View style={{ width: Math.min(width, 420), height: Math.min(height, 260), borderRadius: radius.lg, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
            {game.phase === 'cue' ? (
              <Text_ variant="display" muted>+</Text_>
            ) : (
              <Text_ style={{ fontSize: scale(28), lineHeight: scale(38), fontWeight: '700', textAlign: 'center' }}>{round.phrase}</Text_>
            )}
          </View>
        )
      }
    </GameShell>
  );
}
