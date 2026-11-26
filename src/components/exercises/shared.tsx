import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Text_, Button } from '../ui';
import { MIN_TOUCH, radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';

/** Tur ilerlemesi: her tur bir segment; tamamlananlar egzersizin renginde. */
export function RoundHud({ done, total, color, label }: { done: number; total: number; color: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text_ variant="label" muted>{label}</Text_>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: i < done ? color : colors.surfaceAlt }}
          />
        ))}
      </View>
    </View>
  );
}

/** Oyun alanı: yuvarlatılmış, hafif noktalı zemin. Dokunma verilirse tüm alan etkileşimlidir. */
export function Stage({
  size,
  color,
  children,
  onPress,
  label,
}: {
  size: number;
  color: string;
  children?: React.ReactNode;
  onPress?: () => void;
  label?: string;
}) {
  const { colors } = useTheme();
  const dots = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      dots.push(
        <View
          key={`${r}-${c}`}
          style={{
            position: 'absolute',
            left: ((c + 0.5) / 6) * size - 1.5,
            top: ((r + 0.5) / 6) * size - 1.5,
            width: 3,
            height: 3,
            borderRadius: 1.5,
            backgroundColor: colors.border,
          }}
        />,
      );
    }
  }
  const body = (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        overflow: 'hidden',
      }}
    >
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
        {dots}
      </View>
      {children}
    </View>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" accessibilityLabel={label ?? t('exercises.tapHere')} onPress={onPress} style={{ alignSelf: 'center' }}>
      {body}
    </Pressable>
  ) : (
    <View style={{ alignSelf: 'center' }}>{body}</View>
  );
}

/** Doğru / yanlış geri bildirimi. `key` değiştikçe yeniden canlanır. */
export function Feedback({ ok, text, id }: { ok: boolean | null; text: string; id: number }) {
  const { colors, scale } = useTheme();
  if (ok === null) return <View style={{ height: MIN_TOUCH }} />;
  const bg = ok ? colors.success : colors.danger;
  return (
    <Animated.View
      key={id}
      entering={ZoomIn.duration(200)}
      accessibilityLiveRegion="polite"
      style={{
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        minHeight: MIN_TOUCH,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.pill,
        backgroundColor: bg,
      }}
    >
      <Ionicons name={ok ? 'checkmark-circle' : 'close-circle'} size={22} color="#FFFFFF" />
      <Text_ style={{ color: '#FFFFFF', fontSize: scale(16), fontWeight: '700' }}>{text}</Text_>
    </Animated.View>
  );
}

/** Oyun öncesi hazır paneli: büyük ikon, kısa yönerge ve başlat düğmesi. */
export function ReadyPanel({
  icon,
  color,
  title,
  body,
  cta,
  onStart,
}: {
  icon: string;
  color: string;
  title: string;
  body: string;
  cta: string;
  onStart: () => void;
}) {
  return (
    <View style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg, paddingHorizontal: spacing.md }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: color + '22', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon as any} size={36} color={color} />
      </View>
      <Text_ variant="heading" style={{ textAlign: 'center' }}>{title}</Text_>
      <Text_ muted style={{ textAlign: 'center' }}>{body}</Text_>
      <Button title={cta} onPress={onStart} style={{ alignSelf: 'stretch', backgroundColor: color }} />
    </View>
  );
}
