import React from 'react';
import { Alert, ScrollView, Switch, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Chip, Stepper, Text_ } from '../components/ui';
import { repositories } from '../repositories';
import { useAppStore } from '../store/appStore';
import { syncDailyReminder } from '../services/notifications';
import { spacing, useTheme } from '../theme';
import { EXAMS, ExamTarget } from '../core/exam/types';
import { t } from '../i18n';
import type { LearningMode, ThemeMode } from '../core/settings';

const FONT_SCALES = [1, 1.15, 1.3, 1.5];

/** Yolu ya da sınavı değiştirir; kurs yolu değiştiyse yeni kurs oluşturulur (onayla). */
function changeTrack(patch: { purpose?: 'exam' | 'self'; examTarget?: ExamTarget }) {
  const { settings, level, updateSettings } = useAppStore.getState();
  const wasExam = settings.purpose === 'exam';
  const willBeExam = (patch.purpose ?? settings.purpose) === 'exam';
  const apply = () => {
    updateSettings(patch);
    if (wasExam !== willBeExam && level) repositories().course.start(level);
  };
  if (wasExam === willBeExam || !level) return apply();
  Alert.alert(t('exam.switchTitle'), t('exam.switchMessage'), [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('exam.switchConfirm'), onPress: apply },
  ]);
}

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
      <Card style={{ gap: spacing.md }}>
        <Text_ variant="heading">{t('exam.trackTitle')}</Text_>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          <Chip label={t('exam.trackSelf')} selected={settings.purpose !== 'exam'} onPress={() => changeTrack({ purpose: 'self' })} />
          <Chip label={t('exam.trackExam')} selected={settings.purpose === 'exam'} onPress={() => changeTrack({ purpose: 'exam' })} />
        </View>
        {settings.purpose === 'exam' ? (
          <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
            {(Object.keys(EXAMS) as ExamTarget[]).map((key) => (
              <Chip key={key} label={EXAMS[key].label} selected={settings.examTarget === key} onPress={() => changeTrack({ examTarget: key })} />
            ))}
          </View>
        ) : null}
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
        <Stepper
          label={t('settings.dailyGoal')}
          value={settings.dailyGoalMinutes}
          min={5}
          max={120}
          step={5}
          onChange={(v) => update({ dailyGoalMinutes: v })}
        />
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
