import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text_ } from './ui';
import type { DailyTaskRow } from '../repositories';
import type { DailyKind } from '../core/dailyPlan';
import { dailyRoute, dailyTitle } from '../services/daily';
import { haptic } from '../services/haptics';
import { radius, spacing, useTheme } from '../theme';
import { t } from '../i18n';

const KINDS: Record<DailyKind, { icon: 'eye' | 'flash' | 'book' | 'help-circle' | 'bulb'; color: string }> = {
  attention: { icon: 'eye', color: '#2F7F86' },
  recognition: { icon: 'flash', color: '#B07A2A' },
  fluency: { icon: 'book', color: '#3B75AE' },
  comprehension: { icon: 'help-circle', color: '#3D8B5A' },
  memory: { icon: 'bulb', color: '#76609E' },
};

/** Hafıza görevi, metni okunan test çözülmeden açılmaz. */
const isLocked = (task: DailyTaskRow, plan: DailyTaskRow[]) =>
  task.kind === 'memory' && !plan.some((p) => p.kind === 'comprehension' && p.completed);

/** Bugünkü antrenmanın özet kartı ve görev listesi. */
export function DailyTraining({ plan, totalXp, children }: { plan: DailyTaskRow[]; totalXp: number; children?: React.ReactNode }) {
  const { colors } = useTheme();
  const done = plan.filter((p) => p.completed).length;
  const minutes = plan.reduce((sum, p) => sum + p.minutes, 0);
  const next = plan.find((p) => !p.completed && !isLocked(p, plan));
  const ink = { color: colors.onPrimary };

  const summary = [
    { value: String(plan.length), label: t('daily.tasks') },
    { value: t('today.minutes', { count: minutes }), label: t('daily.estimated') },
    { value: `${done}/${plan.length}`, label: t('daily.completed') },
  ];

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ borderRadius: 24, backgroundColor: colors.primary, padding: spacing.lg, gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
          <Text_ variant="heading" accessibilityRole="header" style={[ink, { flex: 1 }]}>
            {done === plan.length && plan.length > 0 ? t('daily.allDone') : t('daily.title')}
          </Text_>
          <Text_ variant="label" style={ink}>{t('daily.totalXp', { value: totalXp })}</Text_>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {summary.map((s) => (
            <View key={s.label} accessible style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.onPrimary + '1F' }}>
              <Text_ variant="heading" style={ink}>{s.value}</Text_>
              <Text_ variant="caption" style={[ink, { opacity: 0.85, textAlign: 'center' }]}>{s.label}</Text_>
            </View>
          ))}
        </View>
        <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.onPrimary + '33', overflow: 'hidden' }}>
          <View style={{ width: `${plan.length ? (done / plan.length) * 100 : 0}%`, height: '100%', backgroundColor: colors.onPrimary }} />
        </View>
      </View>

      {children}

      {plan.map((task) => {
        const kind = KINDS[task.kind];
        const locked = isLocked(task, plan);
        const current = next?.position === task.position;
        const status = task.completed ? t('course.doneBadge') : locked ? t('daily.memoryLocked') : dailyTitle(task);
        return (
          <Pressable
            key={task.position}
            accessibilityRole="button"
            accessibilityLabel={`${t(`daily.kind.${task.kind}`)}, ${status}`}
            accessibilityState={{ disabled: locked }}
            disabled={locked}
            onPress={() => {
              haptic('light');
              router.push(dailyRoute(task) as any);
            }}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: 20, backgroundColor: colors.surface, borderWidth: current ? 2 : StyleSheet.hairlineWidth, borderColor: current ? colors.primary : colors.border, opacity: pressed ? 0.8 : locked ? 0.55 : 1 })}
          >
            <View style={{ width: 48, height: 48, borderRadius: radius.md, backgroundColor: task.completed ? colors.success : kind.color + '1F', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={task.completed ? 'checkmark' : locked ? 'lock-closed' : kind.icon} size={24} color={task.completed ? '#FFFFFF' : kind.color} />
            </View>
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <Text_ variant="label">{t(`daily.kind.${task.kind}`)}</Text_>
              <Text_ variant="caption" muted numberOfLines={2}>{locked ? t('daily.memoryLocked') : `${t(`daily.hint.${task.kind}`)} · ${dailyTitle(task)}`}</Text_>
              <Text_ variant="caption" muted>{t('today.minutes', { count: task.minutes })}</Text_>
            </View>
            <View style={{ paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.pill, backgroundColor: '#FFD54A33' }}>
              <Text_ variant="caption" style={{ fontWeight: '700' }}>{`${task.xp} XP`}</Text_>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
