import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PremiumBar } from '../../components/Premium';
import { useIsPremium } from '../../store/premiumStore';
import { haptic } from '../../services/haptics';
import { radius, useTheme } from '../../theme';
import { t } from '../../i18n';

const TABS = [
  { name: 'index', label: 'tabs.home', icon: 'home' },
  { name: 'course', label: 'tabs.course', icon: 'school' },
  { name: 'exercises', label: 'tabs.exercises', icon: 'game-controller' },
  { name: 'library', label: 'tabs.library', icon: 'library' },
  { name: 'progress', label: 'tabs.progress', icon: 'stats-chart' },
] as const;

/** Büyük sistem yazısında etiketler en fazla bu kadar büyür; menü taşmaz. */
const MAX_LABEL_SCALE = 1.3;

/**
 * Alt menü: seçili sekmede dolu simge ve yumuşak hap zemin; diğerleri ince çizgili.
 * Genişlik, yazı ölçeği ve güvenli alanlara göre uyum sağlar.
 */
export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const bottom = Math.max(insets.bottom, 8);
  const isPremium = useIsPremium();
  const tabWidth = (width - insets.left - insets.right) / TABS.length;
  const compact = tabWidth < 72;
  const pillWidth = Math.min(56, Math.max(36, tabWidth - 12));
  const fontSize = compact ? 10 : 11;
  const lineHeight = Math.ceil(fontSize * 1.35 * Math.min(fontScale, MAX_LABEL_SCALE));
  const tabs = (
    <Tabs
      screenListeners={{ tabPress: () => haptic('light') }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          // Simge + etiket + boşluklar; yazı büyüdükçe menü de uzar.
          height: 8 + 32 + 4 + lineHeight + 6 + bottom,
          paddingTop: 8,
          paddingBottom: bottom,
          backgroundColor: colors.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: '#000000',
          shadowOpacity: 0.07,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -3 },
          elevation: 10,
        },
        tabBarLabelPosition: 'below-icon',
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: { paddingHorizontal: 0 },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(tab.label),
            tabBarLabel: ({ color }) => (
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                maxFontSizeMultiplier={MAX_LABEL_SCALE}
                style={{ width: tabWidth - 2, textAlign: 'center', fontSize, fontWeight: '600', marginTop: 4, color: color as string }}
              >
                {t(tab.label)}
              </Text>
            ),
            tabBarIcon: ({ color, focused }) => (
              <View style={{ width: pillWidth, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: focused ? colors.primarySoft : 'transparent' }}>
                <Ionicons name={focused ? tab.icon : `${tab.icon}-outline`} color={(color as string) ?? colors.textMuted} size={22} />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );

  if (isPremium) return tabs;
  // Bant üst güvenli alanı kendisi kapladığı için sayfalar ayrıca üst boşluk bırakmaz.
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <PremiumBar />
      <SafeAreaInsetsContext.Provider value={{ ...insets, top: 0 }}>{tabs}</SafeAreaInsetsContext.Provider>
    </View>
  );
}
