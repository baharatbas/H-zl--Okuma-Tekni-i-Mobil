import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { t } from '../../i18n';

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.home'), tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={(color as string) ?? colors.textMuted} size={size} /> }}
      />
      <Tabs.Screen
        name="course"
        options={{ title: t('tabs.course'), tabBarIcon: ({ color, size }) => <Ionicons name="school-outline" color={(color as string) ?? colors.textMuted} size={size} /> }}
      />
      <Tabs.Screen
        name="exercises"
        options={{ title: t('tabs.exercises'), tabBarIcon: ({ color, size }) => <Ionicons name="game-controller-outline" color={(color as string) ?? colors.textMuted} size={size} /> }}
      />
      <Tabs.Screen
        name="library"
        options={{ title: t('tabs.library'), tabBarIcon: ({ color, size }) => <Ionicons name="library-outline" color={(color as string) ?? colors.textMuted} size={size} /> }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: t('tabs.progress'), tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" color={(color as string) ?? colors.textMuted} size={size} /> }}
      />
    </Tabs>
  );
}
