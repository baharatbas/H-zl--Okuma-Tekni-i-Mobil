import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text_ } from '../../components/ui';
import { repositories } from '../../repositories';
import type { TextSummary as Row } from '../../repositories';
import { MIN_TOUCH, radius, spacing, useTheme } from '../../theme';
import { t } from '../../i18n';
import { CATEGORIES, CategoryKey, categoryOf, filterTexts, textOfTheDay } from '../../content/textCategories';
import { localDateString } from '../../core/streak';

const minutesFor = (words: number) => Math.max(1, Math.round(words / 200));
const metaFor = (row: Row) =>
  `${t('library.minutesRead', { minutes: minutesFor(row.wordCount) })} · ${t('library.wordCount', { count: row.wordCount })} · ${t('library.questionCount', { count: row.questions })}`;

const renderCard = ({ item }: { item: Row }) => <TextCard row={item} />;
const Separator = () => <View style={{ height: spacing.md }} />;

const FILTERS: (CategoryKey | 'all')[] = ['all', 'nature', 'science', 'culture', 'life', 'thought', 'work', 'story', 'mine'];

/** Kütüphane: arama, konu filtreleri, günün metni ve kapaklı metin kartları. */
export default function LibraryScreen() {
  const { colors, scale } = useTheme();
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryKey | 'all'>('all');

  useFocusEffect(
    useCallback(() => {
      setRows(repositories().texts.listSummaries());
    }, []),
  );

  const visible = useMemo(() => filterTexts(rows, query, category), [rows, query, category]);
  const daily = useMemo(
    () => textOfTheDay(rows.filter((r) => r.source === 'builtin' && r.key !== 'builtin-level-test'), localDateString()),
    [rows],
  );
  const showDaily = daily !== null && category === 'all' && query.trim() === '';

  const header = (
    <View style={{ gap: spacing.lg, paddingBottom: spacing.md }}>
      <Text_ variant="title" accessibilityRole="header">{t('library.title')}</Text_>

      {/* Arama */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: MIN_TOUCH, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, paddingHorizontal: spacing.lg }}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          accessibilityLabel={t('library.searchPlaceholder')}
          placeholder={t('library.searchPlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          style={{ flex: 1, minHeight: MIN_TOUCH, fontSize: scale(16), color: colors.text }}
        />
        {query ? (
          <Pressable accessibilityRole="button" accessibilityLabel={t('library.clearSearch')} onPress={() => setQuery('')} hitSlop={14}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {/* Konu filtreleri */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.lg }} contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}>
        {FILTERS.map((key) => {
          const selected = category === key;
          const label = key === 'all' ? t('library.filterAll') : CATEGORIES[key].label;
          const icon = key === 'all' ? 'apps-outline' : CATEGORIES[key].icon;
          const tint = key === 'all' ? colors.primary : CATEGORIES[key].color;
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setCategory(key)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: spacing.lg, borderRadius: radius.pill, backgroundColor: selected ? colors.primary : colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: selected ? colors.primary : colors.border }}
            >
              <Ionicons name={icon as any} size={16} color={selected ? colors.onPrimary : tint} />
              <Text_ variant="label" style={{ color: selected ? colors.onPrimary : colors.text }}>{label}</Text_>
            </Pressable>
          );
        })}
      </ScrollView>

      {showDaily ? <DailyCard row={daily} /> : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text_ variant="heading">{category === 'all' ? t('library.allTexts') : CATEGORIES[category].label}</Text_>
          <Text_ variant="caption" muted>{t('library.textCount', { count: visible.length })}</Text_>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('library.newText')}
          onPress={() => router.push('/library/edit')}
          style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: colors.primarySoft, opacity: pressed ? 0.8 : 1 })}
        >
          <Ionicons name="add" size={18} color={colors.primary} />
          <Text_ variant="label" style={{ color: colors.primary }}>{t('library.newText')}</Text_>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <FlatList
        data={visible}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCard}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl }}>
            <Ionicons name="document-text-outline" size={32} color={colors.textMuted} />
            <Text_ muted style={{ textAlign: 'center' }}>
              {category === 'mine' && !query ? t('library.emptyMine') : t('library.noResults')}
            </Text_>
          </View>
        }
        ItemSeparatorComponent={Separator}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}
      />
    </View>
  );
}

/** Günün metni: kategori renginde yumuşak zeminli öne çıkan kart. */
function DailyCard({ row }: { row: Row }) {
  const { colors } = useTheme();
  const cat = CATEGORIES[categoryOf(row)];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t('library.dailyTitle')}: ${row.title}`}
      onPress={() => router.push(`/library/${row.id}`)}
      style={({ pressed }) => ({ borderRadius: radius.lg, backgroundColor: cat.color + '1C', padding: spacing.lg, gap: spacing.md, opacity: pressed ? 0.85 : 1 })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Ionicons name="sunny-outline" size={18} color={cat.color} />
        <Text_ variant="label" style={{ color: cat.color }}>{t('library.dailyTitle')}</Text_>
      </View>
      <View style={{ gap: spacing.xs }}>
        <Text_ variant="title">{row.title}</Text_>
        <Text_ numberOfLines={2} muted>{row.preview}</Text_>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text_ variant="caption" muted>{`${cat.label} · ${t('library.minutesRead', { minutes: minutesFor(row.wordCount) })}`}</Text_>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.lg, height: 40, borderRadius: radius.pill, backgroundColor: colors.primary }}>
          <Text_ variant="label" style={{ color: colors.onPrimary }}>{t('library.openText')}</Text_>
          <Ionicons name="arrow-forward" size={16} color={colors.onPrimary} />
        </View>
      </View>
    </Pressable>
  );
}

/** Metin kartı: solda kategori renginde küçük kitap kapağı. */
const TextCard = React.memo(function TextCard({ row }: { row: Row }) {
  const { colors } = useTheme();
  const cat = CATEGORIES[categoryOf(row)];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${row.title}, ${cat.label}, ${metaFor(row)}`}
      onPress={() => router.push(`/library/${row.id}`)}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, backgroundColor: pressed ? colors.surfaceAlt : colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border })}
    >
      <View style={{ width: 56, height: 72, borderRadius: radius.sm, backgroundColor: cat.color + '1F', alignItems: 'center', justifyContent: 'center', borderLeftWidth: 4, borderLeftColor: cat.color }}>
        <Ionicons name={cat.icon as any} size={24} color={cat.color} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <Text_ variant="caption" style={{ color: cat.color, fontWeight: '600' }}>{cat.label}</Text_>
        <Text_ variant="label" numberOfLines={2}>{row.title}</Text_>
        <Text_ variant="caption" muted numberOfLines={1}>{metaFor(row)}</Text_>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
});
