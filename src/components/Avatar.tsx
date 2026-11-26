import React from 'react';
import { Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text_ } from './ui';
import { initials } from '../core/profile';
import { useTheme } from '../theme';

/** Yuvarlak profil görseli: fotoğraf, yoksa baş harfler, o da yoksa kişi simgesi. */
export function Avatar({ uri, name, size = 72 }: { uri: string | null; name: string; size?: number }) {
  const { colors } = useTheme();
  const frame = { width: size, height: size, borderRadius: size / 2 };
  if (uri) return <Image source={{ uri }} style={frame} accessibilityIgnoresInvertColors />;
  const letters = initials(name);
  return (
    <View style={[frame, { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }]}>
      {letters ? (
        <Text_ allowFontScaling={false} style={{ color: colors.onPrimary, fontSize: size * 0.36, lineHeight: size * 0.48, fontWeight: '700' }}>{letters}</Text_>
      ) : (
        <Ionicons name="person" size={size * 0.5} color={colors.onPrimary} />
      )}
    </View>
  );
}
