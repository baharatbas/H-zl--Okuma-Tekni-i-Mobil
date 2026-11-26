import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Empty, Text_ } from '../../components/ui';
import { repositories } from '../../repositories';
import { useAppStore } from '../../store/appStore';
import { LEVEL_PARAMS } from '../../core/levels';
import { blockChunks, chunkText, ReadingChunk } from '../../core/reader';
import { computeWpm } from '../../core/metrics';
import { recordActivity } from '../../services/activity';
import { MIN_TOUCH, radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';

/** Sayfa içi üst boşluk: çizgiler ve metin bu noktadan başlar. */
const PAGE_PAD_TOP = 56;
const PAGE_PAD_LEFT = 64;

/**
 * Defter görünümlü okuma. Metin, seçilen hız ve yazı ayarlarıyla çizgili sayfada akar.
 * Satırlar metin satırlarıyla aynı aralıkta olduğu için yazı çizgilerin üstüne oturur.
 * Bitince ölçülen okuma hızı kaydedilir.
 */
export default function ReadingPlayScreen() {
  const { id, lesson } = useLocalSearchParams<{ id: string; lesson?: string }>();
  const { colors, scale, scheme } = useTheme();
  const textId = Number(id);
  const repos = useMemo(() => repositories(), []);
  const text = useMemo(() => repos.texts.get(textId), [repos, textId]);

  const settings = useAppStore((s) => s.settings);
  const mode = useAppStore((s) => s.mode);
  const level = useAppStore((s) => s.level);
  const smart = mode === 'smart' && level !== null;
  const speed = smart && level ? LEVEL_PARAMS[level].defaultReadingWpm : settings.readingWpm;
  const unit = settings.readingUnit;

  const paper = scheme === 'dark' ? '#25241C' : '#FFFDF5';
  const ink = scheme === 'dark' ? '#F5F3E8' : '#1E293B';
  const rule = scheme === 'dark' ? '#3F3E33' : '#C7D7EE';
  const marginColor = '#F08A8A';

  const chunks: ReadingChunk[] = useMemo(() => {
    if (!text) return [];
    if (unit === 'block') return blockChunks(text.body, speed);
    return chunkText(text.body, speed, unit === 'word' ? 1 : settings.chunkSize);
  }, [text, speed, unit, settings.chunkSize]);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [summary, setSummary] = useState<{ wpm: number; activeMs: number } | null>(null);
  const [pageHeight, setPageHeight] = useState(0);
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
  const lineHeight = settings.readingFontSize * settings.lineSpacing;
  const isWord = unit === 'word';
  const wordsRead = Math.round(progress * text.wordCount);
  const lineCount = pageHeight > 0 ? Math.max(1, Math.floor((pageHeight - PAGE_PAD_TOP) / lineHeight)) : 0;
  // Tek kelime modunda kelime, sayfanın ortasındaki bir çizgiye oturtulur.
  const wordLineHeight = lineHeight * 1.5;
  const midLine = Math.max(0, Math.floor(lineCount / 2) - 1);
  const wordTop = PAGE_PAD_TOP + (midLine + 1) * lineHeight - 6 - wordLineHeight * 0.78;

  const onPageLayout = (e: LayoutChangeEvent) => setPageHeight(e.nativeEvent.layout.height);

  const continueToTest = () => {
    if (lesson !== undefined) {
      const course = repos.course.getActive();
      if (course) repos.course.completeLesson(course.id, Number(lesson));
    }
    router.replace(`/test/${text.id}${lesson !== undefined ? `?lesson=${lesson}` : ''}` as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: text.title }} />

      {/* Canlı bilgi şeridi */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, height: 32, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt }}>
          <Ionicons name="book-outline" size={14} color={colors.textMuted} />
          <Text_ variant="caption" muted>{`${wordsRead} / ${text.wordCount}`}</Text_>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, height: 32, borderRadius: radius.pill, backgroundColor: colors.primary + '1A' }}>
          <Ionicons name="speedometer-outline" size={14} color={colors.primary} />
          <Text_ variant="caption" style={{ color: colors.primary, fontWeight: '700' }}>{t('common.wpm', { value: speed })}</Text_>
        </View>
      </View>

      {/* Defter sayfası */}
      <View
        onLayout={onPageLayout}
        style={{
          flex: 1,
          marginHorizontal: spacing.lg,
          marginTop: spacing.md,
          marginBottom: spacing.md,
          borderRadius: 18,
          backgroundColor: paper,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: rule,
          shadowColor: '#0F172A',
          shadowOpacity: 0.12,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 5,
        }}
      >
        {/* Sayfa başlığı */}
        <View style={{ position: 'absolute', left: PAGE_PAD_LEFT, right: spacing.lg, top: 18 }}>
          <Text_ variant="caption" numberOfLines={1} style={{ color: ink, opacity: 0.6, letterSpacing: 0.5 }}>
            {text.title.toLocaleUpperCase('tr-TR')}
          </Text_>
        </View>

        {/* Çizgiler: her satır metnin altına oturur */}
        {Array.from({ length: lineCount }, (_, i) => (
          <View
            key={i}
            pointerEvents="none"
            style={{ position: 'absolute', left: 0, right: 0, top: PAGE_PAD_TOP + (i + 1) * lineHeight - 6, height: 1, backgroundColor: rule }}
          />
        ))}
        {/* Kenar çizgisi */}
        <View pointerEvents="none" style={{ position: 'absolute', left: 44, top: 0, bottom: 0, width: 1.5, backgroundColor: marginColor }} />

        {/* Metin alanı */}
        <View style={isWord ? { position: 'absolute', left: PAGE_PAD_LEFT, right: spacing.lg, top: wordTop } : { position: 'absolute', left: PAGE_PAD_LEFT, right: spacing.lg, top: PAGE_PAD_TOP, bottom: spacing.md }}>
          {summary ? (
            <View style={{ alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl }}>
              <Text_ muted>{t('reader.readingWpm')}</Text_>
              <Text_ style={{ fontSize: scale(48), fontWeight: '900', color: colors.primary }}>{String(Math.round(summary.wpm))}</Text_>
              <Text_ muted>{t('common.wpm', { value: '' }).trim()}</Text_>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text_
                accessibilityLiveRegion="polite"
                style={{
                  fontSize: scale(isWord ? settings.readingFontSize * 1.5 : settings.readingFontSize),
                  lineHeight: isWord ? wordLineHeight : lineHeight,
                  color: ink,
                  fontWeight: isWord ? '800' : '400',
                  textAlign: isWord ? 'center' : 'left',
                }}
              >
                {current?.text ?? ''}
              </Text_>
            </ScrollView>
          )}
        </View>
      </View>

      {/* Alt kontrol paneli */}
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md }}>
        {summary ? (
          <View style={{ gap: spacing.sm }}>
            <Button title={t('reader.toTest')} onPress={continueToTest} />
            <Button title={t('reader.restart')} variant="secondary" onPress={restart} />
          </View>
        ) : (
          <>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
              <View style={{ width: `${Math.round(progress * 100)}%`, height: '100%', backgroundColor: colors.primary }} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('reader.restart')}
                onPress={restart}
                style={({ pressed }) => ({ width: MIN_TOUCH, height: MIN_TOUCH, borderRadius: MIN_TOUCH / 2, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}
              >
                <Ionicons name="refresh" size={22} color={colors.text} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={playing ? t('reader.pause') : t('reader.play')}
                onPress={togglePlay}
                style={({ pressed }) => ({ width: 76, height: 76, borderRadius: 38, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.85 : 1, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 })}
              >
                <Ionicons name={playing ? 'pause' : 'play'} size={34} color={colors.onPrimary} style={{ marginLeft: playing ? 0 : 4 }} />
              </Pressable>
              <View style={{ width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' }}>
                <Text_ variant="label" muted>{`%${Math.round(progress * 100)}`}</Text_>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
