import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, RefreshControl, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, SearchX, X } from 'lucide-react-native';
import { colors, fonts, radius, spacing, typography } from '../theme/theme';
import { CATEGORIES } from '../config/store';
import { useCurrency } from '../context/CurrencyContext';
import { useProductFeed } from '../hooks/useProductFeed';
import { useBrands } from '../hooks/useBrands';
import { useQuickAdd } from '../hooks/useQuickAdd';
import ProductCard from '../components/ProductCard';
import FilterChips from '../components/FilterChips';
import CurrencyPill from '../components/CurrencyPill';
import EmptyState from '../components/EmptyState';
import RetryState from '../components/RetryState';
import OfflineBanner from '../components/OfflineBanner';
import { ProductGridSkeleton } from '../components/Skeleton';

export default function ShopScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { currency } = useCurrency();

  const [category, setCategory] = useState('all');
  const [brand, setBrand] = useState('all');
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');

  // Debounce so a search over the full catalogue runs once typing pauses.
  useEffect(() => {
    const t = setTimeout(() => setQuery(text.trim()), 300);
    return () => clearTimeout(t);
  }, [text]);

  // The empty cart's "Browse the shop" button jumps here with { category, ts };
  // `ts` makes repeating the same request still register.
  const jumpStamp = route.params?.ts;
  useEffect(() => {
    const target = route.params?.category;
    if (target) {
      setCategory(target);
      setBrand('all');
      setText('');
      setQuery('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpStamp]);

  const feed = useProductFeed({ category, brand, query });
  const { brands } = useBrands();
  const { quickAdd, quickAddModal } = useQuickAdd();

  // Same as the web: choosing a category clears the brand filter.
  const changeCategory = useCallback((value) => {
    setCategory(value);
    setBrand('all');
  }, []);

  // The brand row only earns its space when there is a choice to make.
  const brandOptions = useMemo(
    () => (brands.length > 1 ? [{ value: 'all', label: 'All brands' }, ...brands.map((b) => ({ value: b, label: b }))] : []),
    [brands]
  );

  const openProduct = useCallback(
    (product) => navigation.navigate('ProductDetail', { id: product.id, product }),
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }) => <ProductCard product={item} currency={currency} onPress={openProduct} onAdd={quickAdd} />,
    [currency, openProduct, quickAdd]
  );

  const showSkeleton = feed.status === 'loading' && feed.products.length === 0;

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.brandRow}>
            <Image source={require('../../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="Carter The Town Wear" />
            <View>
              <Text style={styles.eyebrow}>Full Range</Text>
              <Text style={styles.title}>The Collection</Text>
            </View>
          </View>
          <CurrencyPill />
        </View>

        <View style={styles.searchBar}>
          <Search size={17} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products"
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            selectionColor={colors.gold}
            accessibilityLabel="Search products"
          />
          {feed.busy && query ? <ActivityIndicator size="small" color={colors.gold} /> : null}
          {text ? (
            <TouchableOpacity onPress={() => setText('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" accessibilityLabel="Clear search">
              <X size={17} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <FilterChips options={CATEGORIES} activeValue={category} onChange={changeCategory} style={styles.chipRow} />
        {brandOptions.length > 0 ? (
          <FilterChips options={brandOptions} activeValue={brand} onChange={setBrand} style={styles.chipRow} />
        ) : null}
      </View>

      {showSkeleton ? (
        <ProductGridSkeleton />
      ) : feed.status === 'error' ? (
        <RetryState offline={feed.offline} onRetry={feed.retry} />
      ) : (
        <FlatList
          data={feed.products}
          keyExtractor={(p) => String(p.id)}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          windowSize={7}
          removeClippedSubviews
          onEndReached={feed.loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={feed.refreshing}
              onRefresh={feed.reload}
              tintColor={colors.gold}
              colors={[colors.gold]}
              progressBackgroundColor={colors.surface}
            />
          }
          ListHeaderComponent={feed.offline ? <OfflineBanner onRetry={feed.retry} /> : null}
          ListFooterComponent={
            feed.loadingMore ? <ActivityIndicator color={colors.gold} style={styles.footerSpinner} /> : <View style={{ height: spacing.lg }} />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<SearchX size={26} color={colors.gold} />}
              title="No products found"
              subtitle={query ? `No matches for "${query}". Try a different term.` : 'There are no products here right now. Try a different filter.'}
            />
          }
        />
      )}
      {quickAddModal}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logo: { width: 34, height: 42 },
  eyebrow: { ...typography.label, color: colors.gold, marginBottom: 4 },
  title: { fontFamily: fonts.heading, fontSize: 28, color: colors.textPrimary },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: spacing.lg,
    minHeight: 46,
  },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 14.5, color: colors.textPrimary, paddingVertical: 10 },
  chipRow: { paddingVertical: 2 },
  row: { gap: spacing.md, paddingHorizontal: spacing.lg },
  listContent: { paddingTop: spacing.lg, flexGrow: 1 },
  footerSpinner: { paddingVertical: spacing.xl },
});
