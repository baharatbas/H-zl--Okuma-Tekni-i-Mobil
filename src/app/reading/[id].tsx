import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Empty, Text_ } from '../../components/ui';
import { repositories } from '../../repositories';
import { useAppStore } from '../../store/appStore';
import { LEVEL_PARAMS } from '../../core/levels';
import { blockChunks, chunkText, ReadingChunk } from '../../core/reader';
import { computeWpm } from '../../core/metrics';
import { recordActivity } from '../../services/activity';
import { spacing, useTheme } from '../../theme';
import { t } from '../../i18n';

/** Saniyeyi d:ss biçiminde yazar. */
function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View accessible style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text_ variant="heading" style={{ fontVariant: ['tabular-nums'] }}>{value}</Text_>
      <Text_ variant="caption" muted>{label}</Text_>
    </View>
  );
}

function SideButton({ icon, label, onPress }: { icon: 'refresh' | 'options-outline'; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({ width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
    >
      <Ionicons name={icon} size={22} color={colors.text} />
    </Pressable>
  );
}

/**
 * Sade kitap sayfası görünümünde okuma. Metin, seçilen hız ve yazı ayarlarıyla akar.
 * Bitince ölçülen okuma hızı kaydedilir.
 */
export default function ReadingPlayScreen() {
  const { id, lesson } = useLocalSearchParams<{ id: string; lesson?: string }>();
  const { colors, scale } = useTheme();
  const insets = useSafeAreaInsets();
  const textId = Number(id);
  const repos = useMemo(() => repositories(), []);
  const text = useMemo(() => repos.texts.get(textId), [repos, textId]);

  const settings = useAppStore((s) => s.settings);
  const mode = useAppStore((s) => s.mode);
  const level = useAppStore((s) => s.level);
  const smart = mode === 'smart' && level !== null;
  const speed = smart && level ? LEVEL_PARAMS[level].defaultReadingWpm : settings.readingWpm;
  const unit = settings.readingUnit;

  const chunks: ReadingChunk[] = useMemo(() => {
    if (!text) return [];
    if (unit === 'block') return blockChunks(text.body, speed);
    return chunkText(text.body, speed, unit === 'word' ? 1 : settings.chunkSize);
  }, [text, speed, unit, settings.chunkSize]);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [summary, setSummary] = useState<{ wpm: number; activeMs: number } | null>(null);
  const activeMsRef = useRef(0);
  const playStartRef = useRef<number | null>(null);

  const pauseTimer = () => {
    if (playStartRef.current !== null) {
      activeMsRef.current += Date.now() - playStartRef.current;
      playStartRef.current = null;
    }
    setPlaying(false);
  };

  // Bitiş işlemi zamanlayıcı geri çağrısından çağrılır; son sürüm ref'te tutulur.
  const finishRef = useRef<() => void>(() => undefined);
  useEffect(() => {
    finishRef.current = () => {
      if (!text) return;
      pauseTimer();
      const activeMs = activeMsRef.current;
      const wpm = computeWpm(text.wordCount, activeMs);
      repos.texts.recordReadingSession(text.id, wpm, activeMs, text.wordCount, smart ? 'smart' : 'free');
      recordActivity(activeMs);
      setSummary({ wpm, activeMs });
    };
  });

  useEffect(() => {
    if (!playing || index >= chunks.length) return;
    const timer = setTimeout(() => {
      if (index + 1 >= chunks.length) finishRef.current();
      setIndex(index + 1);
    }, chunks[index].durationMs);
    return () => clearTimeout(timer);
  }, [playing, index, chunks]);

  if (!text) return <Empty text={t('errors.notFound')} />;

  const restart = () => {
    setIndex(0);
    activeMsRef.current = 0;
    playStartRef.current = null;
    setSummary(null);
    setPlaying(false);
  };

  const togglePlay = () => {
    if (playing) return pauseTimer();
    playStartRef.current = Date.now();
    setPlaying(true);
  };

  const current = chunks[Math.min(index, chunks.length - 1)];
  const progress = chunks.length ? Math.min(index, chunks.length) / chunks.length : 0;
  const isWord = unit === 'word';
  const isBlock = unit === 'block';
  const fontSize = scale(isWord ? settings.readingFontSize * 1.6 : settings.readingFontSize);
  const lineHeight = Math.round(fontSize * (isWord ? 1.3 : settings.lineSpacing));
  const wordsRead = Math.round(progress * text.wordCount);
  const remainingMs = chunks.slice(index).reduce((sum, c) => sum + c.durationMs, 0);
  const started = playing || index > 0;

  const continueToTest = () => {
    if (lesson !== undefined) {
      const course = repos.course.getActive();
      if (course) repos.course.completeLesson(course.id, Number(lesson));
    }
    router.replace(`/test/${text.id}${lesson !== undefined ? `?lesson=${Number(lesson) + 1}` : ''}` as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: text.title, headerStyle: { backgroundColor: colors.background }, headerShadowVisible: false }} />

      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
        style={{ height: 4, marginHorizontal: spacing.lg, borderRadius: 2, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}
      >
        <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: colors.primary }} />
      </View>

      <View style={{ flexDirection: 'row', paddingVertical: spacing.md, paddingHorizontal: spacing.lg }}>
        <Stat label={t('reader.statSpeed')} value={String(speed)} />
        <Stat label={t('reader.statWords')} value={`${wordsRead}/${text.wordCount}`} />
        <Stat label={t('reader.statRemaining')} value={formatClock(remainingMs)} />
      </View>

      {/* Okuma sayfası */}
      <View style={{ flex: 1, marginHorizontal: spacing.lg, borderRadius: 20, backgroundColor: colors.paper, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, overflow: 'hidden' }}>
        {summary ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xl }}>
            <Ionicons name="checkmark-circle" size={44} color={colors.success} />
            <Text_ variant="heading">{t('reader.finished')}</Text_>
            <Text_ style={{ fontSize: scale(56), lineHeight: scale(66), fontWeight: '700', color: colors.primary, marginTop: spacing.md }}>{String(Math.round(summary.wpm))}</Text_>
            <Text_ muted>{t('reader.readingWpm')}</Text_>
            <Text_ variant="caption" muted>{t('reader.finishedDetail', { count: text.wordCount, time: formatClock(summary.activeMs) })}</Text_>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.xl }}>
            {/* Kelime ve parça modunda göz için sabit odak çizgileri */}
            {!isBlock && <View style={{ alignSelf: 'center', width: 2, height: 16, backgroundColor: colors.primary, marginBottom: spacing.lg }} />}
            <Text_
              accessibilityLiveRegion="polite"
              style={{ fontSize, lineHeight, color: colors.paperInk, fontWeight: isWord ? '700' : '400', textAlign: isBlock ? 'left' : 'center' }}
            >
              {current?.text ?? ''}
            </Text_>
            {!isBlock && <View style={{ alignSelf: 'center', width: 2, height: 16, backgroundColor: colors.primary, marginTop: spacing.lg }} />}
          </ScrollView>
        )}
      </View>

      {/* Alt kontroller */}
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: Math.max(insets.bottom, spacing.lg), gap: spacing.md }}>
        {summary ? (
          <View style={{ gap: spacing.sm }}>
            <Button title={t('reader.toTest')} onPress={continueToTest} />
            <Button title={t('reader.restart')} variant="secondary" onPress={restart} />
          </View>
        ) : (
          <>
            <Text_ variant="caption" muted style={{ textAlign: 'center' }}>
              {playing ? t('reader.hintPlaying') : started ? t('reader.hintPaused') : t('reader.hintStart')}
            </Text_>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl }}>
              <SideButton icon="refresh" label={t('reader.restart')} onPress={restart} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={playing ? t('reader.pause') : t('reader.play')}
                onPress={togglePlay}
                style={({ pressed }) => ({ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.85 : 1 })}
              >
                <Ionicons name={playing ? 'pause' : 'play'} size={30} color={colors.onPrimary} style={{ marginLeft: playing ? 0 : 4 }} />
              </Pressable>
              <SideButton icon="options-outline" label={t('reader.setupTitle')} onPress={() => router.back()} />
            </View>
          </>
        )}
      </View>
    </View>
  );
}
