import React, { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Button, Card, Empty, Screen, Text_ } from '../components/ui';
import { ReadingTest, ReadingTestResult } from '../components/ReadingTest';
import { repositories } from '../repositories';
import { LEVEL_TEST_KEY } from '../content/builtinTexts';
import { determineLevel, LEVEL_PARAMS, Level } from "../core/levels";
import { useAppStore } from '../store/appStore';
import { recordActivity } from '../services/activity';
import { spacing } from '../theme';
import { t } from '../i18n';

interface Result {
  level: Level;
  wpm: number;
  comprehension: number;
  hadCourse: boolean;
}

/**
 * Seviye tespiti: sabit seviye metni okunur, sorular cevaplanır, seviye hesaplanır.
 * Yeniden çözümde mevcut kurs korunabilir ya da yeni kurs oluşturulabilir.
 */
export default function LevelTestScreen() {
  const repos = useMemo(() => repositories(), []);
  const text = useMemo(() => repos.texts.getByKey(LEVEL_TEST_KEY), [repos]);
  const test = useMemo(() => (text ? repos.texts.getTest(text.id, 'level') : null), [repos, text]);
  const [result, setResult] = useState<Result | null>(null);

  if (!text || !test) return <Screen><Empty text={t('errors.notFound')} /></Screen>;

  const handleFinish = (r: ReadingTestResult) => {
    const level = determineLevel(r.outcome.wpm, r.outcome.comprehension);
    repos.texts.recordTestResult(test.id, r.outcome, r.durationMs, r.startedAt);
    recordActivity(r.durationMs);

    const hadCourse = repos.course.getActive() !== null;
    useAppStore.getState().setLevel(level);
    if (!hadCourse) repos.course.start(level);

    setResult({ level, wpm: r.outcome.wpm, comprehension: r.outcome.comprehension, hadCourse });
  };

  if (!result) {
    return (
      <Screen style={{ paddingBottom: spacing.md }}>
        <ReadingTest
          body={text.body}
          questions={test.questions}
          introText={t('levelTest.intro')}
          onFinish={handleFinish}
        />
      </Screen>
    );
  }

  const label = t(`levels.${result.level}`);
  return (
    <Screen>
      <Text_ variant="title">{t('levelTest.resultTitle')}</Text_>
      <Card style={{ gap: spacing.md }}>
        <Text_ variant="heading">{t('levelTest.resultLevel', { level: label })}</Text_>
        <Text_>{t('levelTest.speedLabel')}: {t('common.wpm', { value: Math.round(result.wpm) })}</Text_>
        <Text_>{t('levelTest.comprehensionLabel')}: {t("common.percent", { value: Math.round(result.comprehension * 100) })}</Text_>
        <Text_ muted variant="caption">{t("common.wpm", { value: LEVEL_PARAMS[result.level].targetWpm })} ({t("levelTest.targetLabel")})</Text_>
      </Card>
      {result.hadCourse ? (
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
    </Screen>
  );
}
