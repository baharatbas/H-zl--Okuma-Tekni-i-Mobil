import React from 'react';
import { ScrollView, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Empty, Text_ } from '../../components/ui';
import { findTactic, TACTIC_PREFIX } from '../../content/tactics';
import { repositories } from '../../repositories';
import { lessonRoute } from '../../services/lessons';
import { radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';

/** Taktik dersi: ne işe yarar, nasıl uygulanır, nerede dikkat edilir. */
export default function TacticScreen() {
  const { key, lesson } = useLocalSearchParams<{ key: string; lesson?: string }>();
  const { colors } = useTheme();
  const tactic = findTactic(`${TACTIC_PREFIX}${key}`);
  if (!tactic) return <Empty text={t('errors.notFound')} />;

  const finish = () => {
    if (lesson === undefined) return router.back();
    const repos = repositories();
    const course = repos.course.getActive();
    if (!course) return router.back();
    const updated = repos.course.completeLesson(course.id, Number(lesson));
    const next = updated.lessons.find((l) => l.orderIndex === Number(lesson) + 1 && !l.isCompleted);
    if (next) router.replace(lessonRoute(next) as any);
    else router.back();
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl }} style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: t('course.stepTactic') }} />
      <View style={{ borderRadius: radius.lg, backgroundColor: colors.primarySoft, padding: spacing.lg, gap: spacing.sm }}>
        <Ionicons name="bulb-outline" size={32} color={colors.primary} />
        <Text_ variant="title" accessibilityRole="header">{tactic.title}</Text_>
        <Text_ muted>{tactic.goal}</Text_>
      </View>

      <Card style={{ gap: spacing.md }}>
        <Text_ variant="heading">{t('course.tacticHow')}</Text_>
        {tactic.steps.map((step, i) => (
          <View key={step} style={{ flexDirection: 'row', gap: spacing.md }}>
            <Text_ variant="label" style={{ color: colors.primary, width: 18 }}>{String(i + 1)}</Text_>
            <Text_ style={{ flex: 1 }}>{step}</Text_>
          </View>
        ))}
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.warning + '1A' }}>
        <Ionicons name="alert-circle-outline" size={20} color={colors.warning} />
        <Text_ variant="caption" style={{ flex: 1 }}>{tactic.caution}</Text_>
      </View>

      <Card style={{ gap: spacing.xs }}>
        <Text_ variant="label">{t('course.tacticTask')}</Text_>
        <Text_>{tactic.task}</Text_>
      </Card>

      <Button title={lesson === undefined ? t('common.back') : t('course.tacticDone')} onPress={finish} />
    </ScrollView>
  );
}
