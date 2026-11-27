import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, ScrollViewInstance, StyleSheet, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, ProgressBar, Text_ } from '../../components/ui';
import { TECHNIQUES } from '../../content/exam/techniques';
import { advice, Attempt, PreparedQuestion, prepareQuestion, stats } from '../../core/exam/practice';
import { QUESTION_TYPES, QuestionType } from '../../core/exam/types';
import { createRng } from '../../core/rng';
import { countWords } from '../../core/metrics';
import { localDateString } from '../../core/streak';
import { repositories } from '../../repositories';
import { recordActivity } from '../../services/activity';
import { haptic } from '../../services/haptics';
import { useTrack } from '../../hooks/useTrack';
import { MIN_TOUCH, radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const DAILY_COUNT = 5;

/** Süreli paragraf çalışması: soru → cevap → açıklama → özet. `type` yoksa karışık set. */
export default function PracticeScreen() {
  const { type, lesson } = useLocalSearchParams<{ type?: string; lesson?: string }>();
  const { colors } = useTheme();
  const { exam } = useTrack();
  const questionType = QUESTION_TYPES.includes(type as QuestionType) ? (type as QuestionType) : null;

  const buildSet = (): PreparedQuestion[] => {
    const rng = createRng(Math.floor(Math.random() * 0xffffffff));
    const repo = repositories().paragraphs;
    const questions = questionType ? repo.practiceSet(questionType, 3, rng) : repo.dailySet(localDateString(), DAILY_COUNT, rng);
    return questions.map((q) => prepareQuestion(q, exam.optionCount, rng));
  };

  const [set, setSet] = useState<PreparedQuestion[]>(buildSet);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [done, setDone] = useState<Attempt[]>([]);
  const [finished, setFinished] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const startedAt = useRef(0);
  const scrollRef = useRef<ScrollViewInstance>(null);

  // Soru değişince süre baştan başlar; cevaplanınca durur.
  useEffect(() => {
    if (answered || finished) return;
    startedAt.current = Date.now();
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - startedAt.current) / 1000)), 500);
    return () => clearInterval(id);
  }, [index, answered, finished, set]);

  const current = set[index];
  const title = questionType ? TECHNIQUES[questionType].title : t('exam.dailyTitle');

  const answer = () => {
    if (selected === null) return;
    const attempt: Attempt = {
      questionId: current.source.id,
      type: current.source.type,
      correct: selected === current.correct,
      durationMs: Date.now() - startedAt.current,
    };
    repositories().paragraphs.record(attempt);
    setDone([...done, attempt]);
    setSeconds(Math.round(attempt.durationMs / 1000));
    setAnswered(true);
    haptic(attempt.correct ? 'success' : 'error');
  };

  const next = () => {
    if (index + 1 < set.length) {
      setIndex(index + 1);
      setSelected(null);
      setAnswered(false);
      setSeconds(0);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      return;
    }
    recordActivity(done.reduce((s, a) => s + a.durationMs, 0));
    if (lesson !== undefined) {
      const repos = repositories();
      const course = repos.course.getActive();
      if (course) repos.course.completeLesson(course.id, Number(lesson));
    }
    setFinished(true);
  };

  const again = () => {
    setSet(buildSet());
    setIndex(0);
    setSelected(null);
    setAnswered(false);
    setDone([]);
    setSeconds(0);
    setFinished(false);
  };

  if (set.length === 0) {
    return (
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }} style={{ backgroundColor: colors.background }}>
        <Stack.Screen options={{ title }} />
        <Card style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl }}>
          <Ionicons name="checkmark-circle" size={48} color={colors.success} />
          <Text_ variant="heading">{t('exam.dailyDone')}</Text_>
          <Text_ muted style={{ textAlign: 'center' }}>{t('exam.dailyDoneBody')}</Text_>
        </Card>
        <Button title={t('common.close')} onPress={() => router.back()} />
      </ScrollView>
    );
  }

  if (finished) {
    const s = stats(done);
    const tip = advice(s, exam.targetSec);
    return (
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }} style={{ backgroundColor: colors.background }}>
        <Stack.Screen options={{ title }} />
        <Card style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl }}>
          <Text_ variant="display">{`${s.correct} / ${s.total}`}</Text_>
          <Text_ muted>{t('exam.correctCount')}</Text_>
          <Text_ variant="heading">{t('exam.avgTime', { sec: s.avgSec ?? 0 })}</Text_>
          <Text_ variant="caption" muted>{t('exam.targetShort', { sec: exam.targetSec })}</Text_>
        </Card>
        <View style={{ flexDirection: 'row', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.primarySoft }}>
          <Ionicons name="bulb-outline" size={22} color={colors.primary} />
          <Text_ style={{ flex: 1 }}>{t(`exam.advice_${tip}`)}</Text_>
        </View>
        {/* Günün seti yinelenmez; yalnızca tip çalışmasında yeni sorular istenebilir. */}
        {questionType ? <Button title={t('exam.again')} onPress={again} /> : null}
        <Button title={t('common.close')} variant="secondary" onPress={() => router.back()} />
      </ScrollView>
    );
  }

  const q = current.source;
  const over = seconds > exam.targetSec;
  return (
    <ScrollView ref={scrollRef} contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl }} style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ title }} />
      <View style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text_ variant="label" muted>{t('exam.questionOf', { current: index + 1, total: set.length })}</Text_>
          <View accessible accessibilityLabel={t('exam.timeA11y', { sec: seconds, target: exam.targetSec })} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, height: 32, borderRadius: radius.pill, backgroundColor: (over ? colors.warning : colors.primary) + '1F' }}>
            <Ionicons name="timer-outline" size={16} color={over ? colors.warning : colors.primary} />
            <Text_ variant="label" style={{ color: over ? colors.warning : colors.primary }}>{`${seconds} / ${exam.targetSec} sn`}</Text_>
          </View>
        </View>
        <ProgressBar value={(index + (answered ? 1 : 0)) / set.length} />
      </View>

      <Card style={{ gap: spacing.sm }}>
        <Text_ variant="caption" muted>{`${TECHNIQUES[q.type].title} · ${t('common.wordsCount', { count: countWords(q.passage) })}`}</Text_>
        <Text_ style={{ lineHeight: 28 }}>{q.passage}</Text_>
      </Card>

      <Text_ variant="heading">{q.stem}</Text_>

      <View style={{ gap: spacing.sm }}>
        {current.options.map((option, i) => {
          const right = answered && i === current.correct;
          const wrong = answered && i === selected && i !== current.correct;
          const picked = !answered && selected === i;
          const edge = right ? colors.success : wrong ? colors.danger : picked ? colors.primary : colors.border;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected === i, disabled: answered }}
              accessibilityLabel={`${LETTERS[i]}: ${option}${right ? `, ${t('exam.rightAnswer')}` : wrong ? `, ${t('exam.wrongAnswer')}` : ''}`}
              disabled={answered}
              onPress={() => setSelected(i)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: MIN_TOUCH + 8, padding: spacing.md, borderRadius: radius.md, borderWidth: right || wrong || picked ? 2 : StyleSheet.hairlineWidth, borderColor: edge, backgroundColor: right ? colors.success + '1A' : wrong ? colors.danger + '1A' : picked ? colors.primarySoft : colors.surface }}
            >
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
                {right || wrong ? <Ionicons name={right ? 'checkmark' : 'close'} size={18} color={edge} /> : <Text_ variant="label">{LETTERS[i]}</Text_>}
              </View>
              <Text_ style={{ flex: 1 }}>{option}</Text_>
            </Pressable>
          );
        })}
      </View>

      {answered ? (
        <>
          <Card style={{ gap: spacing.xs }}>
            <Text_ variant="label" style={{ color: selected === current.correct ? colors.success : colors.danger }}>
              {selected === current.correct ? t('exam.rightAnswer') : t('exam.wrongAnswer')}
            </Text_>
            <Text_>{q.explanation}</Text_>
          </Card>
          <Button title={index + 1 < set.length ? t('common.next') : t('exam.seeResult')} onPress={next} />
        </>
      ) : (
        <Button title={t('exam.answer')} disabled={selected === null} onPress={answer} />
      )}
    </ScrollView>
  );
}
