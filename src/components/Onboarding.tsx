import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text_ } from './ui';
import { radius, spacing, useTheme } from '../theme';

/** İlk açılış ekranlarının ortak düzeni: ilerleme noktaları, başlık, içerik ve alt eylem. */
export function OnboardingFrame({
  step,
  total,
  title,
  subtitle,
  children,
  cta,
  onCta,
  ctaDisabled,
  footer,
}: {
  /** Verilmezse ilerleme çubuğu gösterilmez (hoş geldin ekranı). */
  step?: number;
  total?: number;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  cta: string;
  onCta: () => void;
  ctaDisabled?: boolean;
  footer?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingTop: insets.top + spacing.md, gap: spacing.lg, paddingBottom: spacing.xl }} showsVerticalScrollIndicator={false}>
        {step !== undefined && total !== undefined ? (
          <View style={{ flexDirection: 'row', gap: spacing.xs }} accessibilityLabel={`${step} / ${total}`}>
            {Array.from({ length: total }, (_, i) => (
              <View key={i} style={{ height: 4, flex: 1, borderRadius: 2, backgroundColor: i < step ? colors.primary : colors.surfaceAlt }} />
            ))}
          </View>
        ) : null}
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <Text_ variant="display">{title}</Text_>
          {subtitle ? <Text_ muted>{subtitle}</Text_> : null}
        </View>
        {children}
        {footer}
      </ScrollView>
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: insets.bottom + spacing.md }}>
        <Button title={cta} onPress={onCta} disabled={ctaDisabled} />
      </View>
    </View>
  );
}

/** Numaralı adım satırı. */
export function NumberedRow({ n, text }: { n: number; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Text_ variant="label" style={{ color: colors.primary }}>{String(n)}</Text_>
      </View>
      <Text_ style={{ flex: 1 }}>{text}</Text_>
    </View>
  );
}

/** Seçilebilir kart (tek seçim). */
export function ChoiceCard({ title, body, selected, onPress }: { title: string; body: string; selected: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={title}
      onPress={onPress}
      style={{ minHeight: 64, borderRadius: radius.lg, borderWidth: selected ? 2 : 1, borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primarySoft : colors.surface, padding: spacing.lg, gap: 4 }}
    >
      <Text_ variant="heading">{title}</Text_>
      <Text_ muted>{body}</Text_>
    </Pressable>
  );
}
