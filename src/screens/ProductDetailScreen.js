import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ShoppingBag, Check, MessageCircle, PackageX } from 'lucide-react-native';
import { colors, fonts, radius, spacing, typography } from '../theme/theme';
import { fetchProduct } from '../api/products';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useWhatsApp } from '../hooks/useWhatsApp';
import { photosOf } from '../utils/photos';
import { priceFor, formatItemPrice } from '../utils/currency';
import { categoryLabel } from '../utils/product';
import { buildProductMessage, MAX_QTY, MAX_LINES } from '../utils/cart';
import { hapticSuccess, hapticWarning } from '../utils/haptics';
import PhotoGallery from '../components/PhotoGallery';
import DeliveryNote from '../components/DeliveryNote';
import CurrencyPill from '../components/CurrencyPill';
import PrimaryButton from '../components/PrimaryButton';
import OutlineButton from '../components/OutlineButton';
import LoadingBlock from '../components/LoadingBlock';
import RetryState from '../components/RetryState';
import EmptyState from '../components/EmptyState';

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_HEIGHT = Math.round(SCREEN_WIDTH * 1.2);

/**
 * Full-screen product detail: large image, sticky bottom bar with
 * "Add to cart" and "Order on WhatsApp", both thumb-reachable.
 * Opens instantly from the product the list already had (passed as a
 * param), then refreshes it from GET /products/:id in the background —
 * so it also works offline for anything already seen.
 */
export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const insets = useSafeAreaInsets();
  const { currency } = useCurrency();
  const { items, addItem } = useCart();
  const { sendWhatsApp, whatsappModal } = useWhatsApp();

  const [product, setProduct] = useState(params.product || null);
  const [status, setStatus] = useState(params.product ? 'ready' : 'loading'); // loading | ready | error | gone
  const [errorOffline, setErrorOffline] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [warning, setWarning] = useState(null);
  const addedTimer = useRef(null);

  const load = useCallback(() => {
    fetchProduct(params.id)
      .then((fresh) => {
        setProduct(fresh);
        setStatus('ready');
      })
      .catch((err) => {
        if (err?.response?.status === 404) {
          setStatus('gone');
        } else {
          // Keep whatever we already have on screen; only show the
          // retry state when there is nothing to show at all.
          setErrorOffline(!err?.response);
          setStatus((s) => (s === 'ready' ? 'ready' : 'error'));
        }
      });
  }, [params.id]);

  useEffect(() => {
    load();
    return () => clearTimeout(addedTimer.current);
  }, [load]);

  const goBack = () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Tabs'));
  const openCart = () => navigation.navigate('Tabs', { screen: 'CartTab' });

  const handleAdd = () => {
    const result = addItem(product, 1);
    if (result === 'added' || result === 'increased') {
      hapticSuccess();
      setWarning(null);
      setJustAdded(true);
      clearTimeout(addedTimer.current);
      addedTimer.current = setTimeout(() => setJustAdded(false), 1600);
    } else {
      hapticWarning();
      setWarning(
        result === 'max_qty'
          ? `You can order up to ${MAX_QTY} of one item.`
          : `Your cart is full (${MAX_LINES} different items). Remove one to add another.`
      );
    }
  };

  const handleWhatsApp = () => sendWhatsApp(buildProductMessage(product, currency));

  const topButtons = (
    <View style={[styles.topBar, { top: insets.top + spacing.sm }]} pointerEvents="box-none">
      <TouchableOpacity style={styles.roundBtn} onPress={goBack} accessibilityRole="button" accessibilityLabel="Go back">
        <ChevronLeft size={22} color={colors.textPrimary} />
      </TouchableOpacity>
      <CurrencyPill style={styles.pillOnImage} />
    </View>
  );

  if (status === 'loading') {
    return (
      <View style={styles.flex}>
        <LoadingBlock />
        {topButtons}
      </View>
    );
  }
  if (status === 'error' || status === 'gone' || !product) {
    return (
      <View style={[styles.flex, { paddingTop: insets.top + 64 }]}>
        {status === 'gone' ? (
          <EmptyState
            icon={<PackageX size={26} color={colors.gold} />}
            title="No longer available"
            subtitle="This product has been removed from the shop."
            action={<OutlineButton label="Back to shop" onPress={goBack} fullWidth={false} />}
          />
        ) : (
          <RetryState
            offline={errorOffline}
            onRetry={() => {
              setStatus('loading');
              load();
            }}
          />
        )}
        {topButtons}
      </View>
    );
  }

  const photos = photosOf(product);
  const price = formatItemPrice(product, currency);
  const onRequest = priceFor(product, currency) === null;
  const inCart = items.find((i) => String(i.id) === String(product.id));

  return (
    <View style={styles.flex}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 190 + insets.bottom }}>
        <View style={styles.imageWrap}>
          <PhotoGallery photos={photos} width={SCREEN_WIDTH} height={IMAGE_HEIGHT} label={product.name} />
          <LinearGradient colors={['rgba(0,0,0,0.55)', 'transparent']} style={styles.topShade} pointerEvents="none" />
          <LinearGradient colors={['transparent', colors.bg]} style={styles.bottomShade} pointerEvents="none" />
        </View>

        <View style={styles.content}>
          <Text style={styles.tag}>{product.brand}</Text>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{categoryLabel(product.category)}</Text>
            </View>
          </View>

          <View style={styles.priceBlock}>
            {onRequest ? (
              <Text style={styles.priceRequest}>{price}</Text>
            ) : (
              <Text style={styles.price}>{price}</Text>
            )}
            {onRequest ? <Text style={styles.priceHint}>Message us on WhatsApp for this price.</Text> : null}
          </View>

          {product.description ? <Text style={styles.description}>{product.description}</Text> : null}

          <View style={styles.infoCard}>
            <MessageCircle size={18} color={colors.gold} />
            <Text style={styles.infoText}>
              Orders are agreed on WhatsApp. We confirm availability and how to pay in the chat.
            </Text>
          </View>

          <DeliveryNote style={{ marginTop: spacing.md }} />
        </View>
      </ScrollView>

      {topButtons}

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.xs }]}>
        {warning || inCart ? (
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, warning && { color: colors.danger }]} numberOfLines={2}>
              {warning || `${inCart.quantity} in your cart`}
            </Text>
            {!warning ? (
              <TouchableOpacity onPress={openCart} accessibilityRole="button" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.statusLink}>View cart</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        <View style={styles.actions}>
          <OutlineButton
            label={justAdded ? 'Added' : 'Add to cart'}
            onPress={handleAdd}
            fullWidth={false}
            style={styles.addBtn}
            icon={justAdded ? <Check size={17} color={colors.gold} /> : <ShoppingBag size={17} color={colors.gold} />}
          />
          <PrimaryButton
            label="Order on WhatsApp"
            onPress={handleWhatsApp}
            fullWidth={false}
            style={styles.orderBtn}
            icon={<MessageCircle size={17} color={colors.onGold} />}
          />
        </View>
      </View>

      {whatsappModal}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  imageWrap: { width: SCREEN_WIDTH, height: IMAGE_HEIGHT, backgroundColor: colors.surface },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  bottomShade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 140 },
  topBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roundBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(13,13,13,0.72)',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillOnImage: { backgroundColor: 'rgba(13,13,13,0.72)' },
  content: { paddingHorizontal: spacing.xl, marginTop: -spacing.xxl },
  tag: { ...typography.label, color: colors.gold, marginBottom: 8 },
  name: { fontFamily: fonts.heading, fontSize: 28, lineHeight: 35, color: colors.textPrimary },
  metaRow: { flexDirection: 'row', marginTop: spacing.md },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1.4, color: colors.textSecondary, textTransform: 'uppercase' },
  priceBlock: { marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.borderSubtle },
  price: { fontFamily: fonts.heading, fontSize: 30, color: colors.gold },
  priceRequest: { fontFamily: fonts.heading, fontSize: 22, color: colors.textSecondary },
  priceHint: { fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted, marginTop: 4 },
  description: { fontFamily: fonts.body, fontSize: 14.5, lineHeight: 23, color: colors.textSecondary, marginTop: spacing.lg },
  infoCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  infoText: { flex: 1, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.textMuted },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2 },
  statusText: { flex: 1, fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted },
  statusLink: { fontFamily: fonts.bodyBold, fontSize: 12.5, color: colors.gold, marginLeft: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.md },
  addBtn: { flex: 1 },
  orderBtn: { flex: 1.35 },
});
