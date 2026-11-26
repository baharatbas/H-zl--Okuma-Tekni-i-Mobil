import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Chip, Text_ } from '../../components/ui';
import { repositories } from '../../repositories';
import { spacing, useTheme, MIN_TOUCH } from '../../theme';
import { t } from '../../i18n';

interface DraftQuestion {
  question: string;
  options: string[];
  correct: number;
}

const EMPTY_QUESTION = (): DraftQuestion => ({ question: '', options: ['', '', '', ''], correct: 0 });

export default function LibraryEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors } = useTheme();
  const repos = useMemo(() => repositories(), []);
  const existing = useMemo(() => (id ? repos.texts.get(Number(id)) : null), [repos, id]);
  const existingTest = useMemo(
    () => (existing ? repos.texts.getTest(existing.id, 'custom') : null),
    [repos, existing],
  );

  const [title, setTitle] = useState(existing?.title ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const [questions, setQuestions] = useState<DraftQuestion[]>(() =>
    existingTest
      ? existingTest.questions.map((q) => ({
          question: q.question,
          options: [...q.options, '', '', ''].slice(0, 4),
          correct: q.correctIndex,
        }))
      : [],
  );

  const updateQuestion = (qi: number, patch: Partial<DraftQuestion>) =>
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, ...patch } : q)));

  const save = () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert(t('library.form.errorRequired'));
      return;
    }
    // Her soru: metin dolu, en az iki dolu şık, doğru şık dolu olmalı.
    const built = [];
    for (const q of questions) {
      if (!q.question.trim()) return Alert.alert(t('library.form.errorQuestion'));
      const filled = q.options.map((o, i) => ({ text: o.trim(), index: i })).filter((o) => o.text.length > 0);
      if (filled.length < 2) return Alert.alert(t('library.form.errorQuestion'));
      const correctIndex = filled.findIndex((o) => o.index === q.correct);
      if (correctIndex < 0) return Alert.alert(t('library.form.errorQuestion'));
      built.push({ question: q.question.trim(), options: filled.map((o) => o.text), correctIndex });
    }

    let textId: number;
    if (existing) {
      repos.texts.updateUser(existing.id, title, body);
      textId = existing.id;
    } else {
      textId = repos.texts.createUser(title, body);
    }
    if (built.length > 0) repos.texts.createCustomTest(textId, built);
    else repos.texts.clearCustomTests(textId);

    router.back();
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }} style={{ backgroundColor: colors.background }}>
      <Card style={{ gap: spacing.md }}>
        <Text_ variant="label" muted>{t('library.form.title')}</Text_>
        <TextInput
          accessibilityLabel={t('library.form.title')}
          value={title}
          onChangeText={setTitle}
          style={inputStyle(colors)}
        />
        <Text_ variant="label" muted>{t('library.form.body')}</Text_>
        <TextInput
          accessibilityLabel={t('library.form.body')}
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
          style={[inputStyle(colors), { minHeight: 180 }]}
        />
      </Card>

      <Text_ variant="heading">{t('library.form.questions')}</Text_>
      {questions.map((q, qi) => (
        <Card key={qi} style={{ gap: spacing.sm }}>
          <Text_ variant="label" muted>{`${t('library.form.question')} ${qi + 1}`}</Text_>
          <TextInput
            accessibilityLabel={`${t('library.form.question')} ${qi + 1}`}
            value={q.question}
            onChangeText={(v) => updateQuestion(qi, { question: v })}
            style={inputStyle(colors)}
          />
          {q.options.map((opt, oi) => (
            <View key={oi} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Chip label={String.fromCharCode(65 + oi)} selected={q.correct === oi} accessibilityLabel={`${t('library.form.correct')}: ${String.fromCharCode(65 + oi)}`} onPress={() => updateQuestion(qi, { correct: oi })} />
              <TextInput
                accessibilityLabel={t('library.form.option', { n: oi + 1 })}
                placeholder={t('library.form.option', { n: oi + 1 })}
                placeholderTextColor={colors.textMuted}
                value={opt}
                onChangeText={(v) => updateQuestion(qi, { options: q.options.map((o, i) => (i === oi ? v : o)) })}
                style={[inputStyle(colors), { flex: 1 }]}
              />
            </View>
          ))}
          <Button title={t('library.form.removeQuestion')} variant="ghost" onPress={() => setQuestions((prev) => prev.filter((_, i) => i !== qi))} />
        </Card>
      ))}
      <Button title={t('library.form.addQuestion')} variant="secondary" onPress={() => setQuestions((prev) => [...prev, EMPTY_QUESTION()])} />
      <Button title={t('common.save')} onPress={save} />
    </ScrollView>
  );
}

function inputStyle(colors: ReturnType<typeof useTheme>['colors']) {
  return {
    minHeight: MIN_TOUCH,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  } as const;
}
