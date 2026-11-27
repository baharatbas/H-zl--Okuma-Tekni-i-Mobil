import React, { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Empty, Screen, Text_ } from '../components/ui';
import { ReadingTest, ReadingTestResult } from '../components/ReadingTest';
import { MeasurementSummary } from '../components/MeasurementSummary';
import { repositories } from '../repositories';
import { BUILTIN_TEXTS, LEVEL_TEST_KEY } from '../content/builtinTexts';
import { combineMeasurements, MEASUREMENT_MIN_QUESTIONS, MeasurementFlag, pickBaseline } from '../core/assessment';
import { determineLevel, LEVEL_PARAMS, Level } from '../core/levels';
import { createRng } from '../core/rng';
import { useAppStore } from '../store/appStore';
import { recordActivity } from '../services/activity';
import { spacing, useTheme } from '../theme';
import { t } from '../i18n';

type Part = { wordCount: number; durationMs: number; correctCount: number; totalCount: number; testId: number; result: ReadingTestResult };

const newSeed = () => Date.now() % 2147483647;

/**
 * Seviye tespiti: birbirine yakın zorlukta üç farklı metin okunur ve sonuçlar birleştirilir.
 * Yeniden çözümde mevcut kurs korunabilir ya da yeni kurs oluşturulabilir.
 */
export default function LevelTestScreen() {
  const { colors } = useTheme();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const repos = useMemo(() => repositories(), []);
  const [items] = useState(() => {
    // Yalnızca 5 soruluk ölçüm metinleri: her metinde aynı ölçüt uygulanır.
    const pool = BUILTIN_TEXTS.filter((x) => x.key !== LEVEL_TEST_KEY && x.questions.length >= MEASUREMENT_MIN_QUESTIONS);
    return pickBaseline(pool, repos.texts.seenKeys(), createRng(newSeed())).flatMap((x) => {
      const text = repos.texts.getByKey(x.key);
      const test = text ? repos.texts.getTest(text.id) : null;
      return text && test ? [{ text, test }] : [];
    });
  });
  const [index, setIndex] = useState(0);
  const [reading, setReading] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [flags, setFlags] = useState<MeasurementFlag[]>([]);
  const [result, setResult] = useState<{ level: Level; hadCourse: boolean } | null>(null);

  if (items.length === 0) return <Screen><Empty text={t('errors.notFound')} /></Screen>;
  const item = items[Math.min(index, items.length - 1)];

  const handleFinish = (r: ReadingTestResult) => {
    const nextParts = [...parts, { ...r.outcome, durationMs: r.durationMs, testId: item.test.id, result: r }];
    setParts(nextParts);
    setReading(false);
    if (index + 1 < items.length) return setIndex(index + 1);

    // Üç metin de bitmeden hiçbir başlangıç ölçümü kaydedilmez.
    const found = nextParts.flatMap((p) => repos.texts.recordTestResult(p.testId, p.result.outcome, p.durationMs, p.result.startedAt, p.result.interrupted));
    setFlags([...new Set(found)]);
    recordActivity(nextParts.reduce((sum, p) => sum + p.durationMs, 0));

    const total = combineMeasurements(nextParts);
    const level = determineLevel(total.wpm, total.comprehension);
    const hadCourse = repos.course.getActive() !== null;
    useAppStore.getState().setLevel(level);
    if (!hadCourse) repos.course.start(level);
    setResult({ level, hadCourse });
  };

  if (!result) {
    if (!reading) {
      return (
        <Screen>
          <Text_ variant="title">{t('measure.baselineStep', { current: index + 1, total: items.length })}</Text_>
          <Card style={{ gap: spacing.md }}>
            <Text_>{t('measure.baselineIntro', { total: items.length })}</Text_>
            <Text_ muted>{t('levelTest.intro')}</Text_>
          </Card>
          <Button title={t('measure.ready')} onPress={() => setReading(true)} />
        </Screen>
      );
    }
    return (
      <Screen style={{ paddingBottom: spacing.md }}>
        <ReadingTest key={item.text.id} body={item.text.body} questions={item.test.questions} introText={item.text.title} onFinish={handleFinish} />
      </Screen>
    );
  }

  const total = combineMeasurements(parts);
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }} style={{ backgroundColor: colors.background }}>
      <Text_ variant="title">{t('levelTest.resultLevel', { level: t(`levels.${result.level}`) })}</Text_>
      <MeasurementSummary wpm={total.wpm} comprehension={total.comprehension} correct={total.correct} total={total.total} flags={flags} />
      <Text_ muted variant="caption">{`${t('common.wpm', { value: LEVEL_PARAMS[result.level].targetWpm })} (${t('levelTest.targetLabel')})`}</Text_>
      {from === 'onboarding' ? (
        <Button title={t('common.next')} onPress={() => router.replace('/onboarding/ready' as any)} />
      ) : result.hadCourse ? (
        <>
          <Button
            title={t('course.startNew')}
            onPress={() => {
              repos.course.start(result.level);
              router.replace('/(tabs)/course');
            }}
          />
          <Button title={t('common.cancel')} variant="secondary" onPress={() => router.replace('/(tabs)')} />
        </>
      ) : (
        <Button title={t('levelTest.startCourse')} onPress={() => router.replace('/(tabs)')} />
      )}
    </ScrollView>
  );
}
