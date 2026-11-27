import React, { useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { canUsePremium, OS } from '../core/account';
import { useAppStore } from '../store/appStore';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text_ } from './ui';
import { MIN_TOUCH, radius, spacing, useTheme } from '../theme';
import { t } from '../i18n';

/** Sarı zemin her iki temada aynı kalır; üzerindeki yazı koyudur (yüksek karşıtlık). */
const GOLD = '#F2C14E';
const GOLD_INK = '#3A2C00';
/** Üst bant: uygulamanın ana turkuazının koyu tonu; iki temada da aynı. */
const BAR = '#17555C';
const BAR_SOFT = '#D5ECEE';

type PlanKey = 'monthly' | 'quarterly' | 'yearly';

/** ÖRNEK fiyatlar. Mağaza satın alması bağlanınca fiyatlar mağazadan okunmalıdır. */
const PLANS: { key: PlanKey; price: string }[] = [
  { key: 'yearly', price: '₺499,99' },
  { key: 'quarterly', price: '₺199,99' },
  { key: 'monthly', price: '₺99,99' },
];

const BENEFITS = ['benefitCourses', 'benefitTexts', 'benefitStats', 'benefitAds'] as const;

/** Büyük sistem yazısında bant yazıları en fazla bu kadar büyür. */
const MAX_SCALE = 1.3;

/**
 * Sekmelerin en üstünde sabit duran premium bandı; durum çubuğunun arkasını da doldurur.
 * Dokununca fiyat paneli alttan açılır. Premium üyede çağıran taraf bunu göstermez.
 */
export function PremiumBar() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t('premium.bannerTitle')}. ${t('premium.bannerSubtitle')}`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingTop: insets.top + spacing.xs,
          paddingBottom: spacing.md,
          paddingLeft: insets.left + spacing.lg,
          paddingRight: insets.right + spacing.lg,
          backgroundColor: BAR,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF1F', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="star" size={18} color={GOLD} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text_ variant="label" maxFontSizeMultiplier={MAX_SCALE} numberOfLines={1} style={{ color: '#FFFFFF', fontWeight: '800' }}>{t('premium.bannerTitle')}</Text_>
          <Text_ variant="caption" maxFontSizeMultiplier={MAX_SCALE} numberOfLines={2} style={{ color: BAR_SOFT, fontSize: 12, lineHeight: 16 }}>{t('premium.bannerSubtitle')}</Text_>
        </View>
        <View style={{ minHeight: 36, justifyContent: 'center', paddingHorizontal: spacing.lg, borderRadius: radius.pill, backgroundColor: '#FFFFFF' }}>
          <Text_ variant="label" maxFontSizeMultiplier={MAX_SCALE} style={{ color: BAR }}>{t('premium.seePlans')}</Text_>
        </View>
      </Pressable>
      <PremiumSheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

function PremiumSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors, reducedMotion } = useTheme();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<PlanKey>('yearly');
  const account = useAppStore((s) => s.settings.account);
  const os: OS = Platform.OS === 'ios' ? 'ios' : 'android';
  const allowed = canUsePremium(account, os);

  return (
    <Modal visible={visible} transparent animationType={reducedMotion ? 'fade' : 'slide'} onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000066' }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('premium.close')} onPress={onClose} style={{ flex: 1, minHeight: insets.top + spacing.xl }} />
        <View accessibilityViewIsModal style={{ maxHeight: '88%', backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: Math.max(insets.bottom, spacing.lg) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="star" size={22} color={GOLD_INK} />
              </View>
              <Text_ variant="title" accessibilityRole="header" style={{ flex: 1 }}>{t('premium.title')}</Text_>
              <Pressable accessibilityRole="button" accessibilityLabel={t('premium.close')} onPress={onClose} style={{ width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </Pressable>
            </View>

            <View style={{ gap: spacing.sm }}>
              {BENEFITS.map((key) => (
                <View key={key} style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text_ style={{ flex: 1 }}>{t(`premium.${key}`)}</Text_>
                </View>
              ))}
            </View>

            <View style={{ gap: spacing.sm }}>
              {PLANS.map((plan) => {
                const active = selected === plan.key;
                return (
                  <Pressable
                    key={plan.key}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    onPress={() => setSelected(plan.key)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 2, borderColor: active ? '#E0A800' : colors.border, backgroundColor: active ? GOLD + '26' : colors.surface }}
                  >
                    <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={22} color={active ? '#C79200' : colors.textMuted} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text_ variant="heading">{t(`premium.${plan.key}`)}</Text_>
                      <Text_ variant="caption" muted>{t(`premium.${plan.key}Note`)}</Text_>
                    </View>
                    <Text_ variant="heading">{plan.price}</Text_>
                  </Pressable>
                );
              })}
            </View>

            {!allowed ? (
              <View style={{ padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.warning + '1A', gap: spacing.xs }}>
                <Text_ variant="label">{t(os === 'ios' ? 'premium.needAccountIos' : 'premium.needAccountAndroid')}</Text_>
                <Text_ variant="caption" muted>{t('premium.needAccountSoon')}</Text_>
              </View>
            ) : null}
            <Button title={t('premium.continue')} disabled={!allowed} onPress={() => Alert.alert(t('premium.soonTitle'), t('premium.soonMessage'))} />
            <Text_ variant="caption" muted style={{ textAlign: 'center' }}>{t('premium.sampleNote')}</Text_>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
