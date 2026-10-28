import { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, ArrowUpRight } from 'lucide-react-native';
import { colors, fonts, radius, spacing, typography } from '../theme/theme';
import { CATEGORIES } from '../config/store';
import { useCurrency } from '../context/CurrencyContext';
import { usePicks } from '../hooks/usePicks';
import { hapticTap } from '../utils/haptics';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import CurrencyPill from '../components/CurrencyPill';
import PrimaryButton from '../components/PrimaryButton';
import SectionHeading from '../components/SectionHeading';
import OfflineBanner from '../components/OfflineBanner';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PICK_WIDTH = Math.floor(SCREEN_WIDTH * 0.62);
const TILE_GAP = spacing.md;
const TILE_WIDTH = Math.floor((SCREEN_WIDTH - spacing.lg * 2 - TILE_GAP) / 2);

// "All" goes last so the five real categories lead.
const TILES = [...CATEGORIES.slice(1), { value: 'all', label: 'All products' }];

const STEPS = [
  ['01', 'Pick what you like', 'Add items to your cart and put sizes or colours in the note.'],
  ['02', 'Send it on WhatsApp', 'One message with your whole cart goes straight to us.'],
  ['03', 'Confirm in the chat', 'We confirm availability and agree payment there.'],
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { currency } = useCurrency();
  const { picks, status, offline, reload } = usePicks();
  const [refreshing, setRefreshing] = useState(false);

  const goShop = (category = 'all') => {
    hapticTap();
    navigation.navigate('ShopTab', { category, ts: Date.now() });
  };
  const openProduct = (product) => navigation.navigate('ProductDetail', { id: product.id, product });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reload(); // new random picks
    } finally {
      setRefreshing(false);
    }
  }, [reload]);

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxxl }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} colors={[colors.gold]} progressBackgroundColor={colors.surface} />}
    >
      <View style={styles.topBar}>
        <Text style={styles.brandMark}>CTW</Text>
        <CurrencyPill />
      </View>

      <LinearGradient colors={['#231E0F', '#151515', colors.bg]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Text style={styles.heroTag}>Carter The Town Wear</Text>
        <Text style={styles.heroTitle}>Dress for{'\n'}the town.</Text>
        <Text style={styles.heroBody}>
          Men, women, hoodies, caps and shoes. Build a cart and send your order to us on WhatsApp.
        </Text>
        <PrimaryButton
          label="Shop the collection"
          onPress={() => goShop('all')}
          fullWidth={false}
          icon={<ArrowRight size={17} color={colors.onGold} />}
          style={{ marginTop: spacing.lg }}
        />
      </LinearGradient>

      <View style={styles.section}>
        <SectionHeading eyebrow="Browse" title="Shop by category" />
        <View style={styles.tiles}>
          {TILES.map((tile, i) => (
            <TouchableOpacity
              key={tile.value}
              style={styles.tile}
              onPress={() => goShop(tile.value)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`Shop ${tile.label}`}
            >
              <Text style={styles.tileIndex}>{String(i + 1).padStart(2, '0')}</Text>
              <View style={styles.tileFoot}>
                <Text style={styles.tileLabel}>{tile.label}</Text>
                <ArrowUpRight size={16} color={colors.gold} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeading eyebrow="Picks" title="Three to start with" />
      </View>
      {offline && picks.length > 0 ? <OfflineBanner onRetry={reload} label="You're offline. Showing saved picks." /> : null}
      {status === 'error' ? (
        <View style={styles.picksError}>
          <Text style={styles.picksErrorText}>Picks could not load.</Text>
          <TouchableOpacity onPress={reload} accessibilityRole="button">
            <Text style={styles.picksRetry}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={PICK_WIDTH + spacing.md}
          decelerationRate="fast"
          contentContainerStyle={styles.picksRow}
        >
          {status === 'loading'
            ? [0, 1, 2].map((i) => <ProductCardSkeleton key={i} width={PICK_WIDTH} />)
            : picks.map((p) => <ProductCard key={p.id} product={p} currency={currency} onPress={openProduct} width={PICK_WIDTH} />)}
        </ScrollView>
      )}

      <View style={[styles.section, { marginTop: spacing.xxl }]}>
        <SectionHeading eyebrow="How it works" title="Order on WhatsApp" />
        <View style={styles.steps}>
          {STEPS.map(([n, title, body], i) => (
            <View key={n} style={[styles.step, i > 0 && styles.stepBorder]}>
              <Text style={styles.stepNum}>{n}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{title}</Text>
                <Text style={styles.stepBody}>{body}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  brandMark: { fontFamily: fonts.heading, fontSize: 22, letterSpacing: 3, color: colors.gold },
  hero: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    overflow: 'hidden',
  },
  heroTag: { ...typography.label, color: colors.gold, marginBottom: spacing.md },
  heroTitle: { fontFamily: fonts.heading, fontSize: 40, lineHeight: 46, color: colors.textPrimary },
  heroBody: { fontFamily: fonts.body, fontSize: 14.5, lineHeight: 22, color: colors.textSecondary, marginTop: spacing.md },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xxl },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: TILE_GAP },
  tile: {
    width: TILE_WIDTH,
    height: 96,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  tileIndex: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.4, color: colors.textMuted },
  tileFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tileLabel: { fontFamily: fonts.heading, fontSize: 17, color: colors.textPrimary },
  picksRow: { paddingHorizontal: spacing.lg, gap: spacing.md },
  picksError: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  picksErrorText: { fontFamily: fonts.body, fontSize: 13.5, color: colors.textMuted },
  picksRetry: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: colors.gold },
  steps: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  step: { flexDirection: 'row', gap: spacing.lg, padding: spacing.lg },
  stepBorder: { borderTopWidth: 1, borderTopColor: colors.borderSubtle },
  stepNum: { fontFamily: fonts.heading, fontSize: 22, color: colors.gold, width: 34 },
  stepTitle: { fontFamily: fonts.bodyBold, fontSize: 14.5, color: colors.textPrimary, marginBottom: 3 },
  stepBody: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.textMuted },
});
