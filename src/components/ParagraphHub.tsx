import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text_ } from './ui';
import { TECHNIQUES } from '../content/exam/techniques';
import { QUESTION_TYPES } from '../core/exam/types';
import { Attempt, statsByType } from '../core/exam/practice';
import { useTrack } from '../hooks/useTrack';
import { radius, spacing, useTheme } from '../theme';
import { t } from '../i18n';

/** Günlük paragraf seti kartı. */
export function DailySetCard() {
  const { colors } = useTheme();
  const { exam } = useTrack();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('exam.dailyTitle')}
      onPress={() => router.push('/paragraph/practice')}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.lg, backgroundColor: colors.primary, padding: spacing.lg, opacity: pressed ? 0.85 : 1 })}
    >
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text_ variant="caption" style={{ color: colors.onPrimary, opacity: 0.85 }}>{exam.label}</Text_>
        <Text_ variant="title" style={{ color: colors.onPrimary }}>{t('exam.dailyTitle')}</Text_>
        <Text_ variant="caption" style={{ color: colors.onPrimary, opacity: 0.85 }}>{t('exam.dailyBody', { sec: exam.targetSec })}</Text_>
      </View>
      <Ionicons name="play-circle" size={44} color={colors.onPrimary} />
    </Pressable>
  );
}

/** Soru tiplerinin listesi; her satır tekniğe götürür ve doğruluk oranını gösterir. */
export function TypeList({ attempts }: { attempts: Attempt[] }) {
  const { colors } = useTheme();
  const by = statsByType(attempts);
  return (
    <View style={{ borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' }}>
      {QUESTION_TYPES.map((type, i) => {
        const tech = TECHNIQUES[type];
        const s = by[type];
        const status = s.total ? t('exam.typeAccuracy', { value: Math.round(s.accuracy * 100), total: s.total }) : t('exam.notTried');
        return (
          <Pressable
            key={type}
            accessibilityRole="button"
            accessibilityLabel={`${tech.title}, ${status}`}
            onPress={() => router.push(`/paragraph/technique/${type}`)}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 68, paddingHorizontal: spacing.md, borderTopWidth: i ? StyleSheet.hairlineWidth : 0, borderTopColor: colors.border, backgroundColor: pressed ? colors.surfaceAlt : 'transparent' })}
          >
            <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: tech.color + '1C', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={tech.icon as any} size={20} color={tech.color} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text_ variant="label">{tech.title}</Text_>
              <Text_ variant="caption" muted>{status}</Text_>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        );
      })}
    </View>
  );
}
