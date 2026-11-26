import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, TextProps, View, ViewProps, ViewStyle } from 'react-native';
import { MIN_TOUCH, radius, spacing, type, useTheme } from '../theme';
import { haptic } from '../services/haptics';

type Variant = keyof typeof type | 'display';

/** Yazı: tek skala, kullanıcının yazı çarpanına göre ölçeklenir. */
export function Text_({
  variant = 'body',
  muted,
  color,
  style,
  ...rest
}: TextProps & { variant?: Variant; muted?: boolean; color?: string }) {
  const { colors, scale } = useTheme();
  const spec = type[variant];
  return (
    <Text
      {...rest}
      style={[
        {
          color: color ?? (muted ? colors.textMuted : colors.text),
          fontSize: scale(spec.size),
          fontWeight: spec.weight,
          lineHeight: Math.round(spec.lineHeight * (scale(spec.size) / spec.size)),
        },
        style,
      ]}
    />
  );
}

/** Düz, ince kenarlıklı yüzey. Gölge kullanılmaz. */
export function Card({ children, style, ...rest }: ViewProps & { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View
      {...rest}
      style={[
        { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
  hapticOnPress?: boolean;
}

/** Düğme: 52 pt yükseklik, düz dolgu. */
export function Button({ title, onPress, variant = 'primary', disabled, style, accessibilityHint, hapticOnPress = true }: ButtonProps) {
  const { colors, scale } = useTheme();
  const bg =
    variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : variant === 'secondary' ? colors.surface : 'transparent';
  const fg = variant === 'primary' ? colors.onPrimary : variant === 'danger' ? '#FFFFFF' : variant === 'ghost' ? colors.primary : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={() => {
        if (hapticOnPress) haptic('light');
        onPress();
      }}
      style={({ pressed }) => [
        {
          minHeight: 52,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          borderWidth: variant === 'secondary' ? StyleSheet.hairlineWidth : 0,
          borderColor: colors.border,
        },
        style as ViewStyle,
      ]}
    >
      <Text style={{ color: fg, fontSize: scale(17), fontWeight: '600' }}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, accessibilityLabel }: { label: string; selected: boolean; onPress: () => void; accessibilityLabel?: string }) {
  const { colors, scale } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={{
        minHeight: MIN_TOUCH - 8,
        minWidth: MIN_TOUCH - 8,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: selected ? colors.primary : colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: selected ? colors.primary : colors.border,
      }}
    >
      <Text style={{ color: selected ? colors.onPrimary : colors.text, fontSize: scale(15), fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function Stepper({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  format,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min: number;
  max: number;
  format?: (v: number) => string;
  disabled?: boolean;
}) {
  const { colors, scale } = useTheme();
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const btn = (symbol: string, delta: number, name: string) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      disabled={disabled}
      onPress={() => onChange(clamp(value + delta))}
      style={{ width: MIN_TOUCH, height: MIN_TOUCH, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.4 : 1 }}
    >
      <Text style={{ color: colors.primary, fontSize: scale(22), fontWeight: '600' }}>{symbol}</Text>
    </Pressable>
  );
  return (
    <View accessible accessibilityLabel={`${label}: ${format ? format(value) : value}`} style={{ gap: spacing.xs }}>
      <Text_ variant="label" muted>{label}</Text_>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {btn('−', -step, `${label} azalt`)}
        <Text_ variant="heading">{format ? format(value) : String(value)}</Text_>
        {btn('+', step, `${label} artır`)}
      </View>
    </View>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const { colors } = useTheme();
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'İlerleme'}
      accessibilityValue={{ min: 0, max: 100, now: pct }}
      style={{ height: 6, borderRadius: 3, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}
    >
      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: colors.primary, borderRadius: 3 }} />
    </View>
  );
}

export function Screen({ children, style }: ViewProps & { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <View style={[{ flex: 1, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.lg }, style]}>{children}</View>;
}

export function Loading() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <Card>
      <Text_ muted>{text}</Text_>
    </Card>
  );
}

/** Sayfa başlığı: büyük başlık ve kısa açıklama. Renkli blok yok. */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Text_ variant="display">{title}</Text_>
      {subtitle ? <Text_ muted>{subtitle}</Text_> : null}
    </View>
  );
}
