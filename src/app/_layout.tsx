import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from "react-native";
import { useAppStore } from '../store/appStore';
import { useTheme } from '../theme';
import { Loading, Text_, Button } from '../components/ui';
import { t } from '../i18n';

// Uygulama açıkken gelen bildirimleri de banner olarak göster.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const ready = useAppStore((s) => s.ready);
  const error = useAppStore((s) => s.error);
  const hydrate = useAppStore((s) => s.hydrate);
  const { colors, scheme } = useTheme();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!ready) {
    return (
      <SafeAreaProvider>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Loading />
      </SafeAreaProvider>
    );
  }

  if (error) {
    return (
      <SafeAreaProvider>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <View style={{ flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center', gap: 16 }}>
          <Text_ variant="heading">{t('common.error')}</Text_>
          <Text_ muted>{t('errors.generic')}</Text_>
          <Button title={t('common.retry')} onPress={hydrate} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text },
          contentStyle: { backgroundColor: colors.background },
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="paragraph/practice" options={{ title: t('exam.dailyTitle') }} />
        <Stack.Screen name="paragraph/technique/[type]" options={{ title: t('exam.howTitle') }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="level-test" options={{ title: t('levelTest.title'), presentation: 'modal' }} />
        <Stack.Screen name="settings" options={{ title: t('settings.title') }} />
        <Stack.Screen name="exercise/[key]" options={{ title: t('exercises.title') }} />
        <Stack.Screen name="reader/[id]" options={{ title: t('reader.title') }} />
        <Stack.Screen name="reading/[id]" options={{ title: t('reader.title') }} />
        <Stack.Screen name="test/[id]" options={{ title: t('test.title') }} />
        <Stack.Screen name="library/[id]" options={{ title: t('library.title') }} />
        <Stack.Screen name="library/edit" options={{ title: t('library.newText'), presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
