import React, { useEffect, useRef, useState } from "react";
import { AppState, ScrollView, View } from 'react-native';
import { Button, Card, Chip, Text_ } from './ui';
import { spacing } from '../theme';
import { t } from '../i18n';
import { countWords } from '../core/metrics';
import { scoreTest, TestOutcome, QuestionAnswer } from '../core/testScoring';
import type { TestQuestion } from '../repositories';

export interface ReadingTestResult {
  outcome: TestOutcome;
  durationMs: number;
  startedAt: string;
  /** Okuma sırasında uygulama arka plana geçtiyse true; o süre okumadan düşülür. */
  interrupted: boolean;
}

/**
 * Zamanlı okuma testi: metin okunur (süre ölçülür), sonra sorular cevaplanır.
 * Seviye testinde ve metin testlerinde ortak kullanılır.
 * Okuma süresi, bileşen açıldığı andan "Okumayı bitirdim" butonuna basılana kadar ölçülür (sorular hariç).
 */
export function ReadingTest({
  body,
  questions,
  introText,
  onFinish,
}: {
  body: string;
  questions: TestQuestion[];
  introText?: string;
  onFinish: (result: ReadingTestResult) => void;
}) {
  const [phase, setPhase] = useState<'reading' | 'questions'>('reading');
  const [index, setIndex] = useState(0);
  const [selections, setSelections] = useState<(number | null)[]>(() => questions.map(() => null));
  const startRef = useRef<{ at: number; iso: string } | null>(null);
  useEffect(() => {
    startRef.current = { at: Date.now(), iso: new Date().toISOString() };
  }, []);

  const readingMsRef = useRef(0);
  // Okuma sırasında arka plana geçen süre okuma süresinden düşülür ve ölçüm kesintili işaretlenir.
  const readingRef = useRef(true);
  const bgAtRef = useRef<number | null>(null);
  const pausedMsRef = useRef(0);
  const interruptedRef = useRef(false);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (!readingRef.current) return;
      if (state !== 'active' && bgAtRef.current === null) bgAtRef.current = Date.now();
      if (state === 'active' && bgAtRef.current !== null) {
        pausedMsRef.current += Date.now() - bgAtRef.current;
        bgAtRef.current = null;
        interruptedRef.current = true;
      }
    });
    return () => sub.remove();
  }, []);

  const complete = (answers: (number | null)[]) => {
    const durationMs = readingMsRef.current;
    const pairs: QuestionAnswer[] = questions.map((q, i) => ({ correctIndex: q.correctIndex, selectedIndex: answers[i] }));
    const outcome = scoreTest(body, durationMs, pairs);
    onFinish({ outcome, durationMs, startedAt: startRef.current!.iso, interrupted: interruptedRef.current });
  };

  const finishReading = () => {
    // Süre burada durur; soruları cevaplama süresi okuma hızına katılmaz.
    readingRef.current = false;
    readingMsRef.current = Date.now() - startRef.current!.at - pausedMsRef.current;
    // Soru yoksa test hemen tamamlanır; okuma süresi yine de ölçülür.
    if (questions.length === 0) complete([]);
    else setPhase('questions');
  };

  if (phase === 'reading') {
    return (
      <View style={{ flex: 1, gap: spacing.lg }}>
        {introText ? <Text_ muted>{introText}</Text_> : null}
        <Text_ variant="caption" muted>{t('common.wordsCount', { count: countWords(body) })}</Text_>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: spacing.xl }}>
          <Card>
            <Text_ variant="body" style={{ lineHeight: 28 }}>{body}</Text_>
          </Card>
        </ScrollView>
        <Button title={t('levelTest.finishReading')} onPress={finishReading} />
      </View>
    );
  }

  const q = questions[index];
  const selected = selections[index];

  return (
    <ScrollView contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.xl }}>
      <Text_ variant="caption" muted>{t('levelTest.questionOf', { current: index + 1, total: questions.length })}</Text_>
      <Card style={{ gap: spacing.md }}>
        <Text_ variant="heading">{q.question}</Text_>
        {q.options.map((opt, i) => (
          <Chip
            key={i}
            label={opt}
            selected={selected === i}
            accessibilityLabel={`Şık ${i + 1}: ${opt}`}
            onPress={() => setSelections((prev) => prev.map((v, j) => (j === index ? i : v)))}
          />
        ))}
      </Card>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        {index > 0 && (
          <Button title={t('common.previous')} variant="secondary" style={{ flex: 1 }} onPress={() => setIndex(index - 1)} />
        )}
        {index < questions.length - 1 ? (
          <Button title={t('common.next')} disabled={selected === null} style={{ flex: 1 }} onPress={() => setIndex(index + 1)} />
        ) : (
          <Button title={t('common.finish')} disabled={selected === null} style={{ flex: 1 }} onPress={() => complete(selections)} />
        )}
      </View>
    </ScrollView>
  );
}
