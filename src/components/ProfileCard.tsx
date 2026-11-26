import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { Text_ } from './ui';
import { useAppStore } from '../store/appStore';
import { useTrack } from '../hooks/useTrack';
import { MIN_TOUCH, radius, spacing, useTheme } from '../theme';
import { t } from '../i18n';

/** İlerleme sayfasının en üstündeki profil kartı. */
export function ProfileCard({ streak, bestStreak }: { streak: number; bestStreak: number }) {
  const { colors } = useTheme();
  const name = useAppStore((s) => s.settings.displayName);
  const photo = useAppStore((s) => s.photo);
  const level = useAppStore((s) => s.level);
  const { isExam, exam } = useTrack();
  const track = isExam ? exam.label : t('exam.trackSelf');

  const iconButton = (icon: 'create-outline' | 'settings-outline', label: string, href: '/profile' | '/settings') => (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => router.push(href)} style={{ width: MIN_TOUCH, height: MIN_TOUCH, borderRadius: MIN_TOUCH / 2, backgroundColor: colors.onPrimary + '26', alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={22} color={colors.onPrimary} />
    </Pressable>
  );

  return (
    <View style={{ borderRadius: 24, backgroundColor: colors.primary, padding: spacing.lg, gap: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('profile.edit')} onPress={() => router.push('/profile')}>
          <Avatar uri={photo} name={name} />
        </Pressable>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text_ variant="title" numberOfLines={2} style={{ color: colors.onPrimary }}>{name || t('profile.noName')}</Text_>
          <Text_ variant="caption" style={{ color: colors.onPrimary, opacity: 0.85 }}>{track}</Text_>
        </View>
        {iconButton('create-outline', t('profile.edit'), '/profile')}
        {iconButton('settings-outline', t('home.settings'), '/settings')}
      </View>
      <View style={{ flexDirection: 'row', borderRadius: radius.lg, backgroundColor: colors.onPrimary + '1F', paddingVertical: spacing.md }}>
        <Item label={t('today.level')} value={level ? t(`levels.${level}`) : '—'} />
        <Item label={t('today.streak')} value={String(streak)} />
        <Item label={t('profile.bestStreak')} value={String(bestStreak)} />
      </View>
    </View>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View accessible style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text_ variant="heading" numberOfLines={1} style={{ color: colors.onPrimary }}>{value}</Text_>
      <Text_ variant="caption" style={{ color: colors.onPrimary, opacity: 0.85 }}>{label}</Text_>
    </View>
  );
}
