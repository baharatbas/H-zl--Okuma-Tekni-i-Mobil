import React from 'react';
import { ScrollView, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Empty, Text_ } from '../../../components/ui';
import { TECHNIQUES } from '../../../content/exam/techniques';
import { QUESTION_TYPES, QuestionType } from '../../../core/exam/types';
import { repositories } from '../../../repositories';
import { useTrack } from '../../../hooks/useTrack';
import { radius, spacing, useTheme } from '../../../theme';
import { t } from '../../../i18n';

/** Soru tipi tekniği: ne ister, nasıl çözülür, tuzağı ne. */
export default function TechniqueScreen() {
  const { type, lesson } = useLocalSearchParams<{ type: string; lesson?: string }>();
  const { colors } = useTheme();
  const { exam } = useTrack();
  if (!QUESTION_TYPES.includes(type as QuestionType)) return <Empty text={t('errors.notFound')} />;
  const tech = TECHNIQUES[type as QuestionType];

  const start = () => {
    if (lesson !== undefined) {
      const repos = repositories();
      const course = repos.course.getActive();
      if (course) repos.course.completeLesson(course.id, Number(lesson));
    }
    // Kurstan gelindiyse sıradaki adım (soru çalışması) kurs sırasına göre açılır.
    router.replace(`/paragraph/practice?type=${type}${lesson !== undefined ? `&lesson=${Number(lesson) + 1}` : ''}` as any);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl }} style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: tech.title }} />
      <View style={{ borderRadius: radius.lg, backgroundColor: tech.color + '1C', padding: spacing.lg, gap: spacing.sm }}>
        <Ionicons name={tech.icon as any} size={32} color={tech.color} />
        <Text_ variant="title">{tech.title}</Text_>
        <Text_ muted>{tech.goal}</Text_>
      </View>

      <Card style={{ gap: spacing.md }}>
        <Text_ variant="heading">{t('exam.howTitle')}</Text_>
        {tech.steps.map((step, i) => (
          <View key={step} style={{ flexDirection: 'row', gap: spacing.md }}>
            <Text_ variant="label" style={{ color: tech.color, width: 18 }}>{String(i + 1)}</Text_>
            <Text_ style={{ flex: 1 }}>{step}</Text_>
          </View>
        ))}
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.warning + '1A' }}>
        <Ionicons name="alert-circle-outline" size={20} color={colors.warning} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text_ variant="label">{t('exam.trapTitle')}</Text_>
          <Text_ variant="caption">{tech.trap}</Text_>
        </View>
      </View>

      <Text_ variant="caption" muted style={{ textAlign: 'center' }}>{t('exam.targetNote', { exam: exam.label, sec: exam.targetSec })}</Text_>
      <Button title={t('exam.startPractice')} onPress={start} />
    </ScrollView>
  );
}
