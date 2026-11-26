import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text_ } from './ui';
import { useTheme } from '../theme';

/** Dairesel ilerleme göstergesi. Değer 0–1 arasıdır. */
export function ProgressRing({ value, size = 88, stroke = 8, label, sub, trackColor }: { value: number; size?: number; stroke?: number; label: string; sub?: string; trackColor?: string }) {
  const { colors } = useTheme();
  const v = Math.min(1, Math.max(0, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(v * 100) }} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor ?? colors.surfaceAlt} strokeWidth={stroke} fill="none" />
        {v > 0 && (
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.primary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c * v} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        )}
      </Svg>
      <Text_ variant="heading">{label}</Text_>
      {sub ? <Text_ variant="caption" muted>{sub}</Text_> : null}
    </View>
  );
}
