import React from 'react';
import { Alert, Platform, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingFrame } from '../../components/Onboarding';
import { Text_ } from '../../components/ui';
import { loginOptions, OS } from '../../core/account';
import { useAppStore } from '../../store/appStore';
import { radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';

const os: OS = Platform.OS === 'ios' ? 'ios' : 'android';

/**
 * Tanıtımdan sonra, sorulardan önce: giriş ya da misafir. Google ve Apple girişleri daha sonra bağlanacak;
 * şimdilik bilgi verir. Misafir seçimi cihazda kalıcı olarak saklanır.
 */
export default function LoginScreen() {
  const { colors } = useTheme();
  const updateSettings = useAppStore((s) => s.updateSettings);
  const options = loginOptions(os);

  const chooseGuest = () => {
    updateSettings({ account: 'guest' });
    router.push('/onboarding/about' as any);
  };

  const provider = () => Alert.alert(t('login.soonTitle'), t('login.soonBody'));

  const button = (key: 'google' | 'apple', icon: 'logo-google' | 'logo-apple', label: string) => (
    <Pressable
      key={key}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={provider}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, minHeight: 56, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.8 : 1 })}
    >
      <Ionicons name={icon} size={20} color={colors.text} />
      <Text_ variant="heading">{label}</Text_>
    </Pressable>
  );

  return (
    <OnboardingFrame
      title={t('login.title')}
      subtitle={t('login.subtitle')}
      cta={t('login.guest')}
      onCta={chooseGuest}
      footer={<Text_ variant="caption" muted style={{ textAlign: 'center' }}>{t('login.guestNote')}</Text_>}
    >
      <View style={{ gap: spacing.md }}>
        {options.includes('google') ? button('google', 'logo-google', t('login.google')) : null}
        {options.includes('apple') ? button('apple', 'logo-apple', t('login.apple')) : null}
      </View>
    </OnboardingFrame>
  );
}
