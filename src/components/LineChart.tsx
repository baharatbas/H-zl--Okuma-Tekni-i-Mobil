import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../theme';
import type { Scale } from '../core/progressStats';

const AXIS = 36;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;
const PAD_RIGHT = 12;

/** Eksen değerli, tarih etiketli alan grafiği (react-native-svg). Tek ölçümde de anlamlı görünür. */
export function LineChart({
  points,
  scale,
  height = 190,
  color,
  accessibilityLabel,
}: {
  points: { value: number; label: string }[];
  scale: Scale;
  height?: number;
  color?: string;
  accessibilityLabel: string;
}) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const stroke = color ?? colors.primary;

  const w = Math.max(0, width - AXIS - PAD_RIGHT);
  const h = height - PAD_TOP - PAD_BOTTOM;
  const span = scale.max - scale.min || 1;
  const yOf = (v: number) => PAD_TOP + h - ((v - scale.min) / span) * h;
  const xy = points.map((p, i) => ({
    x: AXIS + (points.length === 1 ? w / 2 : 8 + (i / (points.length - 1)) * (w - 16)),
    y: yOf(p.value),
  }));
  const line = xy.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const first = xy[0];
  const last = xy[xy.length - 1];
  const area = xy.length > 1 ? `${line} L${last.x.toFixed(1)},${PAD_TOP + h} L${first.x.toFixed(1)},${PAD_TOP + h} Z` : '';

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={{ height, width: '100%' }}
    >
      {width > 0 && (
        <Svg width={width} height={height}>
          {scale.ticks.map((tick) => (
            <React.Fragment key={tick}>
              <Line x1={AXIS} x2={width - PAD_RIGHT} y1={yOf(tick)} y2={yOf(tick)} stroke={colors.border} strokeWidth={1} />
              <SvgText x={AXIS - 8} y={yOf(tick) + 4} fontSize={11} fill={colors.textMuted} textAnchor="end">
                {String(tick)}
              </SvgText>
            </React.Fragment>
          ))}
          {area ? <Path d={area} fill={stroke} fillOpacity={0.12} /> : null}
          {xy.length > 1 && <Path d={line} stroke={stroke} strokeWidth={2.5} fill="none" strokeLinejoin="round" />}
          {last && <Circle cx={last.x} cy={last.y} r={5} fill={stroke} stroke={colors.surface} strokeWidth={2} />}
          {points.length > 0 && (
            <SvgText x={points.length === 1 ? first.x : AXIS} y={height - 6} fontSize={11} fill={colors.textMuted} textAnchor={points.length === 1 ? 'middle' : 'start'}>
              {points[0].label}
            </SvgText>
          )}
          {points.length > 1 && (
            <SvgText x={width - PAD_RIGHT} y={height - 6} fontSize={11} fill={colors.textMuted} textAnchor="end">
              {points[points.length - 1].label}
            </SvgText>
          )}
        </Svg>
      )}
    </View>
  );
}
