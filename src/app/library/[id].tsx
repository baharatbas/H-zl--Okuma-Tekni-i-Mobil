import React, { useMemo } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Button, Card, Empty, Text_ } from '../../components/ui';
import { repositories } from '../../repositories';
import { spacing, useTheme } from '../../theme';
import { t } from '../../i18n';

/** Metin detayı: başlık, kısa bilgiler, eylemler ve metin. */
export default function LibraryTextScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const repos = useMemo(() => repositories(), []);
  const text = useMemo(() => repos.texts.get(Number(id)), [repos, id]);
  const test = useMemo(() => (text ? repos.texts.getTest(text.id) : null), [repos, text]);

  if (!text) return <Empty text={t('errors.notFound')} />;

  const questions = test?.questions.length ?? 0;
  const minutes = Math.max(1, Math.round(text.wordCount / 250));

  const confirmDelete = () => {
    Alert.alert(t('library.deleteTitle'), t('library.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          repos.texts.deleteUser(text.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl }} style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: t('library.title') }} />

      <View style={{ gap: spacing.xs }}>
        <Text_ variant="caption" muted>{text.source === 'builtin' ? t('library.builtin') : t('library.mine')}</Text_>
        <Text_ variant="title">{text.title}</Text_>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Info value={String(text.wordCount)} label={t('library.statWords')} />
        <Info value={String(questions)} label={t('library.statQuestions')} />
        <Info value={`~${minutes}`} label={t('library.statMinutes')} />
      </View>

      <View style={{ gap: spacing.sm }}>
        <Button title={t('library.read')} onPress={() => router.push(`/reader/${text.id}`)} />
        {questions > 0 ? (
          <Button title={t('library.test')} variant="secondary" onPress={() => router.push(`/test/${text.id}`)} />
        ) : (
          <Text_ muted>{t('library.noTest')}</Text_>
        )}
      </View>

      <Card>
        <Text_ variant="body" style={{ lineHeight: 26 }}>{text.body}</Text_>
      </Card>

      {text.source === 'user' ? (
        <View style={{ gap: spacing.sm }}>
          <Button title={t('library.editText')} variant="secondary" onPress={() => router.push(`/library/edit?id=${text.id}`)} />
          <Button title={t('library.deleteText')} variant="danger" onPress={confirmDelete} />
        </View>
      ) : (
        <Text_ variant="caption" muted style={{ textAlign: 'center' }}>{t('library.builtinNote')}</Text_>
      )}
    </ScrollView>
  );
}

function Info({ value, label }: { value: string; label: string }) {
  return (
    <Card style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: spacing.md, paddingHorizontal: spacing.sm }}>
      <Text_ variant="heading">{value}</Text_>
      <Text_ variant="caption" muted>{label}</Text_>
    </Card>
  );
}
