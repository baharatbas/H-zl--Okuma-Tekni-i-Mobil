import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ProgressBar, Text_ } from '../ui';
import type { ExerciseResult, ExerciseSettings } from '../../core/exercises/types';
import { generateSchulteGrid, schulteParams, summarizeSchulte } from '../../core/exercises/schulte';
import { createRng } from '../../core/rng';
import { haptic } from '../../services/haptics';
import { useAppStore } from '../../store/appStore';
import { MIN_TOUCH, radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';

const GAP = 8;
const newGrid = (size: number) => generateSchulteGrid(size, createRng(Math.floor(Math.random() * 0xffffffff)));
const clock = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Tam ekran Schulte Tablosu: duraklat, titreşim, geri sayım, ızgara ve sıradaki sayı. */
export function SchulteGame({
  settings,
  onFinish,
  onQuit,
}: {
  settings: ExerciseSettings;
  onFinish: (r: ExerciseResult) => void;
  onQuit: () => void;
}) {
  const { colors, scale } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const hapticsOn = useAppStore((s) => s.settings.hapticsEnabled);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const [params] = useState(() => schulteParams(settings.difficulty, settings.durationSec));
  const [grid, setGrid] = useState(() => newGrid(params.size));
  const [next, setNext] = useState(1);
  const [wrong, setWrong] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [remaining, setRemaining] = useState(params.durationMs);
  const counts = useRef({ hits: 0, mistakes: 0 });
  const remainingRef = useRef(params.durationMs);
  const finished = useRef(false);
  const finishRef = useRef(onFinish);

  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  // Geri sayım: duraklatınca kalan süre korunur.
  useEffect(() => {
    if (paused) return;
    const base = remainingRef.current;
    const startedAt = Date.now();
    const id = setInterval(() => {
      const left = Math.max(0, base - (Date.now() - startedAt));
      remainingRef.current = left;
      setRemaining(left);
      if (left === 0 && !finished.current) {
        finished.current = true;
        clearInterval(id);
        const s = summarizeSchulte(params, counts.current.hits, counts.current.mistakes, params.durationMs);
        finishRef.current({ score: s.score, accuracy: s.accuracy, avgResponseMs: s.avgResponseMs, durationMs: params.durationMs });
      }
    }, 100);
    return () => clearInterval(id);
  }, [paused, params]);

  useEffect(() => {
    if (wrong === null) return;
    const id = setTimeout(() => setWrong(null), 300);
    return () => clearTimeout(id);
  }, [wrong]);

  const tap = (value: number) => {
    if (paused || finished.current) return;
    if (value !== next) {
      counts.current.mistakes++;
      setWrong(value);
      haptic('error');
      return;
    }
    counts.current.hits++;
    haptic('light');
    if (value === params.size * params.size) {
      setGrid(newGrid(params.size));
      setNext(1);
      return;
    }
    setNext(value + 1);
    if (params.reshuffle) setGrid(newGrid(params.size));
  };

  const board = Math.min(width - spacing.lg * 2, height * 0.62);
  const cell = Math.floor((board - GAP * (params.size - 1)) / params.size);
  const round = { width: MIN_TOUCH, height: MIN_TOUCH, borderRadius: MIN_TOUCH / 2, backgroundColor: colors.surfaceAlt, alignItems: 'center' as const, justifyContent: 'center' as const };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.md, paddingHorizontal: spacing.lg, gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Pressable accessibilityRole="button" accessibilityLabel={paused ? t('schulte.resume') : t('schulte.pause')} onPress={() => setPaused((p) => !p)} style={round}>
          <Ionicons name={paused ? 'play' : 'pause'} size={22} color={colors.text} />
        </Pressable>
        <Text_ variant="label" muted style={{ flex: 1, textAlign: 'center' }} numberOfLines={2}>{t('schulte.header', { level: params.level })}</Text_>
        <Pressable accessibilityRole="switch" accessibilityState={{ checked: hapticsOn }} accessibilityLabel={t('schulte.haptics')} onPress={() => updateSettings({ hapticsEnabled: !hapticsOn })} style={round}>
          <Ionicons name={hapticsOn ? 'phone-portrait' : 'phone-portrait-outline'} size={20} color={hapticsOn ? colors.primary : colors.textMuted} />
        </Pressable>
        <Text_ variant="heading" style={{ minWidth: 48, textAlign: 'right', fontVariant: ['tabular-nums'] }}>{clock(remaining)}</Text_>
      </View>
      <ProgressBar value={1 - remaining / params.durationMs} />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {paused ? (
          <View style={{ alignSelf: 'stretch', gap: spacing.md }}>
            <Text_ variant="title" style={{ textAlign: 'center' }}>{t('schulte.paused')}</Text_>
            <Button title={t('schulte.resume')} onPress={() => setPaused(false)} />
            <Button title={t('exercises.quit')} variant="secondary" onPress={onQuit} />
          </View>
        ) : (
          <View style={{ width: cell * params.size + GAP * (params.size - 1), flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}>
            {grid.map((value) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityLabel={String(value)}
                onPressIn={() => tap(value)}
                style={{ width: cell, height: cell, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: wrong === value ? colors.danger + '33' : colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: wrong === value ? colors.danger : colors.border }}
              >
                <Text_ allowFontScaling={false} style={{ fontSize: Math.min(scale(32), cell * 0.42), lineHeight: cell * 0.6, fontWeight: '700' }}>{String(value)}</Text_>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <Text_ muted style={{ textAlign: 'center' }} accessibilityLiveRegion="polite">{t('schulte.next', { value: next })}</Text_>
    </View>
  );
}
