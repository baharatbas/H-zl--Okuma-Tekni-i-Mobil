import React from 'react';
import { Alert, ScrollView, Switch, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Chip, Stepper, Text_ } from '../components/ui';
import { repositories } from '../repositories';
import { useAppStore } from '../store/appStore';
import { syncDailyReminder } from '../services/notifications';
import { spacing, useTheme } from '../theme';
import { TrackSelector } from '../components/TrackSelector';
import { t } from '../i18n';
import { DAILY_MINUTES } from '../core/dailyPlan';
import { localDateString } from '../core/streak';
import type { LearningMode, ThemeMode } from '../core/settings';

const FONT_SCALES = [1, 1.15, 1.3, 1.5];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, gap: spacing.md }}>
      <Text_ style={{ flex: 1 }}>{label}</Text_>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const { colors } = useTheme();
  const settings = useAppStore((s) => s.settings);
  const mode = useAppStore((s) => s.mode);
  const level = useAppStore((s) => s.level);
  const update = useAppStore((s) => s.updateSettings);
  const setMode = useAppStore((s) => s.setMode);

  const setReminder = async (patch: { reminderEnabled?: boolean; reminderHour?: number }) => {
    update(patch);
    const next = { ...settings, ...patch };
    const ok = await syncDailyReminder(next.reminderEnabled, next.reminderHour);
    if (next.reminderEnabled && !ok) Alert.alert(t('settings.reminder'), t('settings.reminderPermission'));
  };

  const themeOptions: { key: ThemeMode; label: string }[] = [
    { key: 'system', label: t('settings.themeSystem') },
    { key: 'light', label: t('settings.themeLight') },
    { key: 'dark', label: t('settings.themeDark') },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }} style={{ backgroundColor: colors.background }}>
      <Card>
        <TrackSelector />
      </Card>

      <Card style={{ gap: spacing.md }}>
        <Text_ variant="heading">{t('settings.appearance')}</Text_>
        <Text_ variant="label" muted>{t('settings.theme')}</Text_>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          {themeOptions.map((o) => (
            <Chip key={o.key} label={o.label} selected={settings.theme === o.key} onPress={() => update({ theme: o.key })} />
          ))}
        </View>
      </Card>

      <Card style={{ gap: spacing.md }}>
        <Text_ variant="heading">{t('settings.accessibility')}</Text_>
        <Text_ variant="label" muted>{t('settings.fontScale')}</Text_>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          {FONT_SCALES.map((s) => (
            <Chip key={s} label={`${Math.round(s * 100)}%`} selected={settings.fontScale === s} onPress={() => update({ fontScale: s })} />
          ))}
        </View>
        <Row label={t('settings.reducedMotion')}>
          <Switch
            accessibilityLabel={t('settings.reducedMotion')}
            value={settings.reducedMotion}
            onValueChange={(v) => update({ reducedMotion: v })}
          />
        </Row>
        <Row label={t('settings.haptics')}>
          <Switch
            accessibilityLabel={t('settings.haptics')}
            value={settings.hapticsEnabled}
            onValueChange={(v) => update({ hapticsEnabled: v })}
          />
        </Row>
      </Card>

      <Card style={{ gap: spacing.md }}>
        <Text_ variant="heading">{t('settings.learning')}</Text_>
        <Text_ variant="label" muted>{t('settings.dailyGoal')}</Text_>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          {DAILY_MINUTES.map((m) => (
            <Chip
              key={m}
              label={t('today.minutes', { count: m })}
              selected={settings.dailyGoalMinutes === m}
              onPress={() => {
                update({ dailyGoalMinutes: m });
                // Bugün hiç görev tamamlanmadıysa antrenman yeni süreye göre kurulur.
                repositories().daily.reset(localDateString());
              }}
            />
          ))}
        </View>
        <Row label={t('settings.reminder')}>
          <Switch
            accessibilityLabel={t('settings.reminder')}
            value={settings.reminderEnabled}
            onValueChange={(v) => setReminder({ reminderEnabled: v })}
          />
        </Row>
        {settings.reminderEnabled && (
          <Stepper
            label={t('settings.reminderHour', { hour: String(settings.reminderHour).padStart(2, '0') })}
            value={settings.reminderHour}
            min={0}
            max={23}
            onChange={(v) => setReminder({ reminderHour: v })}
          />
        )}
        <Text_ variant="label" muted>{t('settings.readingMode')}</Text_>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {(['smart', 'free'] as LearningMode[]).map((m) => (
            <Chip
              key={m}
              label={m === 'smart' ? t('reader.modeSmart') : t('reader.modeFree')}
              selected={mode === m}
              onPress={() => setMode(m)}
            />
          ))}
        </View>
      </Card>

      <Card style={{ gap: spacing.md }}>
        <Text_ variant="heading">{t('settings.data')}</Text_>
        <Button title={t('settings.retakeLevel')} variant="secondary" onPress={() => router.push('/level-test')} />
        <Button
          title={t('settings.restartCourse')}
          variant="danger"
          disabled={!level}
          onPress={() =>
            Alert.alert(t('course.restartTitle'), t('course.restartMessage'), [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('course.restart'),
                style: 'destructive',
                onPress: () => {
                  if (level) repositories().course.start(level);
                },
              },
            ])
          }
        />
        <Text_ variant="caption" muted>{t('settings.about')}</Text_>
      </Card>
    </ScrollView>
  );
}
