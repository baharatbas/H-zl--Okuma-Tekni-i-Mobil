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

/**
 * Bugünkü antrenman: tek kart. Üstte kısa özet ve ilerleme, altında hafta ve sade görev satırları.
 */
export function DailyTraining({ plan, totalXp, children }: { plan: DailyTaskRow[]; totalXp: number; children?: React.ReactNode }) {
  const { colors } = useTheme();
  const done = plan.filter((p) => p.completed).length;
  const minutes = plan.filter((p) => !p.completed).reduce((sum, p) => sum + p.minutes, 0);
  const next = plan.find((p) => !p.completed && !isLocked(p, plan));
  const finished = plan.length > 0 && done === plan.length;
  const line = { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border };

  return (
    <View style={{ borderRadius: 20, backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, overflow: 'hidden' }}>
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text_ variant="heading" accessibilityRole="header">{finished ? t('daily.allDone') : t('daily.title')}</Text_>
            <Text_ variant="caption" muted>
              {finished ? t('daily.tomorrow') : t('daily.summary', { done, total: plan.length, minutes })}
            </Text_>
          </View>
          <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, backgroundColor: colors.primarySoft }}>
            <Text_ variant="caption" style={{ color: colors.primary, fontWeight: '700' }}>{t('daily.totalXp', { value: totalXp })}</Text_>
          </View>
        </View>
        <View accessible accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: plan.length, now: done }} style={{ height: 6, borderRadius: 3, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
          <View style={{ width: `${plan.length ? (done / plan.length) * 100 : 0}%`, height: '100%', borderRadius: 3, backgroundColor: finished ? colors.success : colors.primary }} />
        </View>
        {children}
      </View>

      {/* Tamamlanan görevler listeden kalkar; sayısı üstteki özette görünür. */}
      {plan.filter((p) => !p.completed).map((task) => {
        const kind = KINDS[task.kind];
        const locked = isLocked(task, plan);
        const current = next?.position === task.position;
        const detail = locked ? t('daily.memoryLocked') : `${dailyTitle(task)} · ${t('today.minutes', { count: task.minutes })}`;
        return (
          <Pressable
            key={task.position}
            accessibilityRole="button"
            accessibilityLabel={`${t(`daily.kind.${task.kind}`)}, ${detail}, ${task.xp} XP`}
            accessibilityState={{ disabled: locked }}
            disabled={locked}
            onPress={() => {
              haptic('light');
              router.push(dailyRoute(task) as any);
            }}
            style={({ pressed }) => [line, { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 60, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, backgroundColor: pressed ? colors.surfaceAlt : current ? colors.primarySoft : 'transparent', opacity: locked ? 0.5 : 1 }]}
          >
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: current ? colors.surface : kind.color + '1A', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={locked ? 'lock-closed' : kind.icon} size={18} color={kind.color} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text_ variant="label" numberOfLines={1}>{t(`daily.kind.${task.kind}`)}</Text_>
              <Text_ variant="caption" muted numberOfLines={1}>{detail}</Text_>
            </View>
            <Text_ variant="caption" muted>{`+${task.xp}`}</Text_>
            {current ? (
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="play" size={14} color={colors.onPrimary} />
              </View>
            ) : (
              <Ionicons name="chevron-forward" size={16} color={locked ? 'transparent' : colors.textMuted} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
