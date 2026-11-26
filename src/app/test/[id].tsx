import React, { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Button, Card, Empty, Screen, Text_ } from '../../components/ui';
import { ReadingTest, ReadingTestResult } from '../../components/ReadingTest';
import { repositories } from '../../repositories';
import { recordActivity } from '../../services/activity';
import { spacing, useTheme } from '../../theme';
import { t } from '../../i18n';
import { lessonNote } from '../../content/lessonNotes';
import { comprehensionPercent } from '../../core/metrics';

/** Metin testi: okuma hızı ve anlama oranı ölçülür ve kaydedilir. */
export default function TextTestScreen() {
  const { id, lesson } = useLocalSearchParams<{ id: string; lesson?: string }>();
  const { colors } = useTheme();
  const repos = useMemo(() => repositories(), []);
  const text = useMemo(() => repos.texts.get(Number(id)), [repos, id]);
  const test = useMemo(() => (text ? repos.texts.getTest(text.id) : null), [repos, text]);
  const [result, setResult] = useState<ReadingTestResult | null>(null);

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
    repos.texts.recordTestResult(test.id, r.outcome, r.durationMs, r.startedAt);
    recordActivity(r.durationMs);
    if (lesson !== undefined) {
      const course = repos.course.getActive();
      if (course) repos.course.completeLesson(course.id, Number(lesson));
    }
    setResult(r);
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
      <Card style={{ gap: spacing.md }}>
        <Text_ variant="heading">{t('common.wpm', { value: Math.round(result.outcome.wpm) })}</Text_>
        <Text_>
          {t('levelTest.comprehensionLabel')}: {t('common.percent', { value: comprehensionPercent(result.outcome.correctCount, result.outcome.totalCount) })}
        </Text_>
        <Text_ muted>{`${result.outcome.correctCount} / ${result.outcome.totalCount}`}</Text_>
      </Card>
      <Button title={t('library.read')} variant="secondary" onPress={() => setResult(null)} />
      <Button title={t('common.close')} onPress={() => router.back()} />
    </ScrollView>
  );
}
