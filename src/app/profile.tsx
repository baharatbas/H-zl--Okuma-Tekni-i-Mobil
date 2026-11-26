import React, { useState } from 'react';
import { Alert, ScrollView, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Avatar } from '../components/Avatar';
import { Button, Text_ } from '../components/ui';
import { useAppStore } from '../store/appStore';
import { PickedPhoto, pickPhoto } from '../services/profilePhoto';
import { MIN_TOUCH, radius, spacing, useTheme } from '../theme';
import { t } from '../i18n';

/** Profil düzenleme: fotoğraf ve ad. Kaydedilene kadar hiçbir şey değişmez. */
export default function ProfileScreen() {
  const { colors, scale } = useTheme();
  const saved = useAppStore((s) => s.photo);
  const setPhoto = useAppStore((s) => s.setPhoto);
  const savedName = useAppStore((s) => s.settings.displayName);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const [name, setName] = useState(savedName);
  /** undefined: değişmedi, null: kaldırılacak, nesne: yeni seçilen. */
  const [picked, setPicked] = useState<PickedPhoto | null | undefined>(undefined);
  const preview = picked === undefined ? saved : (picked?.uri ?? null);

  const choose = async () => {
    try {
      const photo = await pickPhoto();
      if (photo) setPicked(photo);
    } catch {
      Alert.alert(t('profile.photoError'));
    }
  };

  const save = () => {
    try {
      if (picked !== undefined) setPhoto(picked);
      updateSettings({ displayName: name.trim() });
      router.back();
    } catch {
      Alert.alert(t('profile.photoError'));
    }
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }} style={{ backgroundColor: colors.background }}>
      <View style={{ alignItems: 'center', gap: spacing.md }}>
        <Avatar uri={preview} name={name} size={128} />
        <Button title={preview ? t('profile.changePhoto') : t('profile.addPhoto')} variant="secondary" onPress={choose} />
        {preview ? <Button title={t('profile.removePhoto')} variant="ghost" onPress={() => setPicked(null)} /> : null}
      </View>
      <View style={{ gap: spacing.sm }}>
        <Text_ variant="label">{t('profile.name')}</Text_>
        <TextInput
          accessibilityLabel={t('profile.name')}
          value={name}
          onChangeText={setName}
          placeholder={t('onboarding.namePlaceholder')}
          placeholderTextColor={colors.textMuted}
          maxLength={24}
          returnKeyType="done"
          style={{ minHeight: MIN_TOUCH + 4, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.md, fontSize: scale(16), color: colors.text }}
        />
        <Text_ variant="caption" muted>{t('profile.privacy')}</Text_>
      </View>
      <Button title={t('common.save')} onPress={save} />
    </ScrollView>
  );
}
