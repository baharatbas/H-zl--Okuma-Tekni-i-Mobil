import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Chip, Empty, Text_ } from '../../components/ui';
import { repositories } from '../../repositories';
import { memoryOptions, scoreMemory } from '../../core/memoryChallenge';
import { createRng } from '../../core/rng';
import { BUILTIN_TEXTS } from '../../content/builtinTexts';
import { completeDaily } from '../../services/daily';
import { recordActivity } from '../../services/activity';
import { haptic } from '../../services/haptics';
import { spacing, useTheme } from '../../theme';
import { t } from '../../i18n';

const nowMs = () => Date.now();

/** Hafıza meydan okuması: testte okunan metinde hangi kelimeler geçti? */
export default function MemoryScreen() {
  const { id, daily } = useLocalSearchParams<{ id: string; daily?: string }>();
  const { colors } = useTheme();
  const [round] = useState(() => {
    const text = repositories().texts.get(Number(id));
    if (!text) return null;
    const others = BUILTIN_TEXTS.filter((x) => x.key !== text.key).map((x) => x.body);
    return { title: text.title, options: memoryOptions(text.body, others, createRng(text.id)), startedAt: nowMs() };
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [score, setScore] = useState<number | null>(null);

  if (!round) return <Empty text={t('errors.notFound')} />;

  const check = () => {
    setScore(scoreMemory(round.options, selected));
    recordActivity(nowMs() - round.startedAt);
    completeDaily(daily);
    haptic('success');
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }} style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: t('daily.kind.memory') }} />
      <View style={{ gap: spacing.xs }}>
        <Text_ variant="title">{round.title}</Text_>
        <Text_ muted>{t('daily.memoryPrompt')}</Text_>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {round.options.map((o) => (
          <Chip
            key={o.word}
            label={score === null ? o.word : `${o.inText ? '✓' : '✕'} ${o.word}`}
            selected={selected.includes(o.word)}
            onPress={() => {
              if (score !== null) return;
              setSelected((prev) => (prev.includes(o.word) ? prev.filter((w) => w !== o.word) : [...prev, o.word]));
            }}
          />
        ))}
      </View>

      {score === null ? (
        <Button title={t('daily.memoryCheck')} disabled={selected.length === 0} onPress={check} />
      ) : (
        <View style={{ alignItems: 'center', gap: spacing.md }}>
          <Ionicons name="checkmark-circle" size={44} color={colors.success} />
          <Text_ variant="heading">{t('daily.memoryResult', { correct: score, total: round.options.length })}</Text_>
          <Text_ variant="caption" muted style={{ textAlign: 'center' }}>{t('daily.memoryLegend')}</Text_>
          <Button title={t('daily.backToPlan')} style={{ alignSelf: 'stretch' }} onPress={() => router.back()} />
        </View>
      )}
    </ScrollView>
  );
}
