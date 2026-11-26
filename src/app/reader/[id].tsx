import React, { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Chip, Empty, Stepper, Text_ } from '../../components/ui';
import { repositories } from '../../repositories';
import { useAppStore } from '../../store/appStore';
import { lessonNote } from '../../content/lessonNotes';
import { LEVEL_PARAMS } from '../../core/levels';
import { radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';
import type { ReadingMode } from '../../core/settings';

/**
 * Hızlı Oku ayarları: hız, okuma birimi, yazı boyutu ve satır aralığı burada ayarlanır.
 * "Oyna" ile defter görünümlü okuma ekranı açılır.
 */
export default function ReaderSetupScreen() {
  const { id, lesson, daily } = useLocalSearchParams<{ id: string; lesson?: string; daily?: string }>();
  const { colors, scale } = useTheme();
  const textId = Number(id);
  const text = useMemo(() => repositories().texts.get(textId), [textId]);

  const settings = useAppStore((s) => s.settings);
  const mode = useAppStore((s) => s.mode);
  const level = useAppStore((s) => s.level);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const setMode = useAppStore((s) => s.setMode);

  if (!text) return <Empty text={t('errors.notFound')} />;

  const smart = mode === 'smart' && level !== null;
  const speed = smart && level ? LEVEL_PARAMS[level].defaultReadingWpm : settings.readingWpm;
  const unit = settings.readingUnit;
  const note = lessonNote(text.key);
  const preview = text.body.split(/(?<=[.!?…])\s+/).slice(0, 2).join(' ');
  const lineHeight = settings.readingFontSize * settings.lineSpacing;
  const minutes = Math.max(1, Math.round(text.wordCount / Math.max(1, speed)));

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl }} style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: t('reader.setupTitle') }} />

      <View style={{ gap: spacing.xs }}>
        <Text_ variant="title">{text.title}</Text_>
        <Text_ muted>{t('reader.setupSubtitle', { count: text.wordCount, minutes })}</Text_>
      </View>

      {/* Önizleme: defter sayfasının küçük hali */}
      {note ? (
        <View style={{ flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primary + '14', alignItems: 'flex-start' }}>
          <Ionicons name="bulb-outline" size={20} color={colors.primary} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text_ variant="label" style={{ color: colors.primary }}>{t('reader.strategyTitle')}</Text_>
            <Text_ variant="caption">{note.strategy}</Text_>
          </View>
        </View>
      ) : null}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <View style={{ padding: spacing.md, backgroundColor: colors.paper }}>
          <Text_ variant="caption" muted style={{ color: colors.paperInk }}>{t('reader.previewTitle')}</Text_>
          <Text_ style={{ color: colors.paperInk, fontSize: scale(settings.readingFontSize * 0.7), lineHeight: lineHeight * 0.7, marginTop: spacing.xs }}>
            {preview}
          </Text_>
        </View>
      </Card>

      <Card style={{ gap: spacing.lg }}>
        <Text_ variant="label" muted>{t('reader.modeTitle')}</Text_>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {(['smart', 'free'] as const).map((m) => (
            <Chip key={m} label={m === 'smart' ? t('reader.modeSmart') : t('reader.modeFree')} selected={mode === m} onPress={() => setMode(m)} />
          ))}
        </View>
        <Text_ variant="caption" muted>{mode === 'smart' ? t('reader.smartHint') : t('reader.freeHint')}</Text_>

        <Stepper
          label={t('reader.speed')}
          value={speed}
          min={80}
          max={1000}
          step={20}
          disabled={smart}
          format={(v) => t('common.wpm', { value: v })}
          onChange={(v) => updateSettings({ readingWpm: v })}
        />

        <Text_ variant="label" muted>{t('reader.unitTitle')}</Text_>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          {(['word', 'chunk', 'block'] as ReadingMode[]).map((u) => (
            <Chip
              key={u}
              label={u === 'word' ? t('reader.unitWord') : u === 'chunk' ? t('reader.unitChunk') : t('reader.unitBlock')}
              selected={unit === u}
              onPress={() => updateSettings({ readingUnit: u })}
            />
          ))}
        </View>
        {unit === 'chunk' && (
          <Stepper label={t('reader.chunkSize')} value={settings.chunkSize} min={2} max={4} onChange={(v) => updateSettings({ chunkSize: v })} />
        )}

        <Stepper
          label={t('reader.fontSize')}
          value={settings.readingFontSize}
          min={14}
          max={40}
          step={2}
          onChange={(v) => updateSettings({ readingFontSize: v })}
        />
        <Stepper
          label={t('reader.lineSpacing')}
          value={settings.lineSpacing}
          min={1.2}
          max={2.4}
          step={0.1}
          format={(v) => v.toFixed(1)}
          onChange={(v) => updateSettings({ lineSpacing: Math.round(v * 10) / 10 })}
        />
      </Card>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('reader.startReading')}
        onPress={() => router.push(`/reading/${text.id}${lesson !== undefined ? `?lesson=${lesson}` : daily !== undefined ? `?daily=${daily}` : ''}` as any)}
        style={({ pressed }) => ({
          minHeight: 56,
          borderRadius: radius.lg,
          backgroundColor: colors.primary,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Ionicons name="play" size={22} color={colors.onPrimary} />
        <Text_ style={{ color: colors.onPrimary, fontSize: scale(18), fontWeight: '800' }}>{t('reader.startReading')}</Text_>
      </Pressable>
    </ScrollView>
  );
}
