import React, { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Button, Empty, Screen, Text_ } from '../../components/ui';
import { ReadingTest, ReadingTestResult } from '../../components/ReadingTest';
import { repositories } from '../../repositories';
import { recordActivity } from '../../services/activity';
import { completeDaily } from '../../services/daily';
import { spacing, useTheme } from '../../theme';
import { t } from '../../i18n';
import { lessonNote } from '../../content/lessonNotes';
import { MeasurementFlag, speedCostsComprehension } from '../../core/assessment';
import { MeasurementSummary } from '../../components/MeasurementSummary';

/** Metin testi: okuma hızı ve anlama oranı ölçülür ve kaydedilir. */
export default function TextTestScreen() {
  const { id, lesson, daily } = useLocalSearchParams<{ id: string; lesson?: string; daily?: string }>();
  const { colors } = useTheme();
  const repos = useMemo(() => repositories(), []);
  const text = useMemo(() => repos.texts.get(Number(id)), [repos, id]);
  const test = useMemo(() => (text ? repos.texts.getTest(text.id) : null), [repos, text]);
  const [result, setResult] = useState<(ReadingTestResult & { flags: MeasurementFlag[]; costWarning: boolean }) | null>(null);

  if (!text) return <Screen><Empty text={t('errors.notFound')} /></Screen>;
  if (!test || test.questions.length === 0) {
    return (
      <Screen>
        <Stack.Screen options={{ title: text.title }} />
        <Empty text={t('library.noTest')} />
      </Screen>
    );
  }

  const handleFinish = (r: ReadingTestResult) => {
    const previous = repos.progress.getPerformanceSeries(1)[0];
    const flags = repos.texts.recordTestResult(test.id, r.outcome, r.durationMs, r.startedAt);
    recordActivity(r.durationMs);
    completeDaily(daily);
    if (lesson !== undefined) {
      const course = repos.course.getActive();
      if (course) repos.course.completeLesson(course.id, Number(lesson));
    }
    setResult({ ...r, flags, costWarning: flags.length === 0 && speedCostsComprehension(previous, r.outcome) });
  };

  if (!result) {
    return (
      <Screen style={{ paddingBottom: spacing.md }}>
        <Stack.Screen options={{ title: text.title }} />
        <ReadingTest body={text.body} questions={test.questions} introText={lessonNote(text.key)?.objective ?? t('test.intro')} onFinish={handleFinish} />
      </Screen>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }} style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: text.title }} />
      <Text_ variant="title">{t('test.resultTitle')}</Text_>
      <MeasurementSummary wpm={result.outcome.wpm} comprehension={result.outcome.comprehension} correct={result.outcome.correctCount} total={result.outcome.totalCount} flags={result.flags} costWarning={result.costWarning} />
      <Button title={t('library.read')} variant="secondary" onPress={() => setResult(null)} />
      <Button title={t('common.close')} onPress={() => router.back()} />
    </ScrollView>
  );
}
