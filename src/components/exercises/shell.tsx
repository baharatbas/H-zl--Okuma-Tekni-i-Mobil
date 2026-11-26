import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text_ } from '../ui';
import type { ExerciseResult, ExerciseSettings } from '../../core/exercises/types';
import { MIN_TOUCH, radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';

export interface GameProps {
  settings: ExerciseSettings;
  onFinish: (result: ExerciseResult) => void;
  onQuit: () => void;
}

export const nowMs = () => Date.now();
export const elapsedSince = (start: number) => Date.now() - start;
export const newSeed = () => Math.floor(Math.random() * 0xffffffff) >>> 0;

/** Tur sonrası geri bildirimin ekranda kalma süresi. */
export const FEEDBACK_MS = 1200;

/** Tam ekran oyun düzeni: çıkış, başlık, ilerleme, ortada sahne, altta kontroller. */
export function GameShell({
  title,
  subtitle,
  color,
  progress,
  badge,
  onQuit,
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  color: string;
  progress: number;
  badge?: string;
  onQuit: () => void;
  footer?: React.ReactNode;
  children: (area: { width: number; height: number; size: number }) => React.ReactNode;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [area, setArea] = useState({ width: 0, height: 0 });
  const size = Math.max(0, Math.min(area.width, area.height, 420));
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.md, paddingHorizontal: spacing.lg, gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('exercises.quit')} onPress={onQuit} style={{ width: MIN_TOUCH, height: MIN_TOUCH, borderRadius: MIN_TOUCH / 2, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text_ variant="label" numberOfLines={1}>{title}</Text_>
          {subtitle ? <Text_ variant="caption" muted>{subtitle}</Text_> : null}
        </View>
        <View style={{ minWidth: MIN_TOUCH + 12, height: 36, paddingHorizontal: spacing.sm, borderRadius: radius.pill, backgroundColor: badge ? color + '1C' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
          {badge ? <Text_ variant="label" style={{ color, fontVariant: ['tabular-nums'] }}>{badge}</Text_> : null}
        </View>
      </View>
      <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }} style={{ height: 6, borderRadius: 3, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
        <View style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%`, height: '100%', backgroundColor: color }} />
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} onLayout={(e) => setArea(e.nativeEvent.layout)}>
        {size > 0 ? children({ ...area, size }) : null}
      </View>
      <View style={{ minHeight: 76, justifyContent: 'flex-end', gap: spacing.sm }}>{footer}</View>
    </View>
  );
}

/** Kare oyun alanı. Dokunma verilirse tüm alan etkileşimlidir. */
export function Board({ size, children, onPress, label }: { size: number; children?: React.ReactNode; onPress?: () => void; label?: string }) {
  const { colors } = useTheme();
  const style = { width: size, height: size, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, overflow: 'hidden' as const };
  return onPress ? (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPressIn={onPress} style={style}>{children}</Pressable>
  ) : (
    <View style={style}>{children}</View>
  );
}

export function Center({ children }: { children: React.ReactNode }) {
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.lg }}>{children}</View>;
}

/** Kısa yönerge. */
export function Hint({ text }: { text: string }) {
  return <Text_ muted style={{ textAlign: 'center' }}>{text}</Text_>;
}

/** Doğru / yanlış geri bildirimi (ikon + yazı; yalnızca renge bağlı değil). */
export function Verdict({ ok, text }: { ok: boolean; text: string }) {
  const { colors } = useTheme();
  const tint = ok ? colors.success : colors.danger;
  return (
    <Animated.View entering={FadeIn.duration(150)} accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, minHeight: 52, paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: tint + '1C' }}>
      <Ionicons name={ok ? 'checkmark-circle' : 'close-circle'} size={22} color={tint} />
      <Text_ variant="label" style={{ flexShrink: 1 }}>{text}</Text_>
    </Animated.View>
  );
}

/** Sayı girişi: büyük − / + düğmeleri. */
export function Counter({ value, max, color, label, onChange }: { value: number; max: number; color: string; label: string; onChange: (v: number) => void }) {
  const button = (icon: 'remove' | 'add', next: number, name: string) => (
    <Pressable accessibilityRole="button" accessibilityLabel={name} onPress={() => onChange(Math.min(max, Math.max(0, next)))} style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: color + '1C', alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={28} color={color} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
      {button('remove', value - 1, `${label}: azalt`)}
      <Text_ accessibilityLiveRegion="polite" variant="display" style={{ minWidth: 72, textAlign: 'center' }}>{String(value)}</Text_>
      {button('add', value + 1, `${label}: artır`)}
    </View>
  );
}

/** Çoktan seçmeli şık listesi; cevaptan sonra doğru ve yanlış işaretlenir. */
export function Choices({ options, correct, picked, onPick }: { options: string[]; correct: number; picked: number | null; onPick: (i: number) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignSelf: 'stretch', gap: spacing.sm }}>
      {options.map((option, i) => {
        const right = picked !== null && i === correct;
        const wrong = picked === i && i !== correct;
        const edge = right ? colors.success : wrong ? colors.danger : colors.border;
        return (
          <Pressable
            key={`${i}-${option}`}
            accessibilityRole="button"
            accessibilityLabel={`${option}${right ? `, ${t('exercises.correctMsg')}` : wrong ? `, ${t('exercises.wrongMsg')}` : ''}`}
            disabled={picked !== null}
            onPress={() => onPick(i)}
            style={({ pressed }) => ({ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: right || wrong ? 2 : StyleSheet.hairlineWidth, borderColor: edge, backgroundColor: right ? colors.success + '1C' : wrong ? colors.danger + '1C' : pressed ? colors.surfaceAlt : colors.surface })}
          >
            <Text_ style={{ flex: 1, textAlign: 'center' }}>{option}</Text_>
            {right || wrong ? <Ionicons name={right ? 'checkmark' : 'close'} size={20} color={edge} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/** `active` olduğu sürece `ms` sonra bir kez `done` çağırır. `token` değişince yeniden kurulur. */
export function useDelay(active: boolean, ms: number, done: () => void, token: unknown = 0) {
  const ref = useRef(done);
  useEffect(() => {
    ref.current = done;
  });
  useEffect(() => {
    if (!active) return;
    const id = setTimeout(() => ref.current(), ms);
    return () => clearTimeout(id);
  }, [active, ms, token]);
}
