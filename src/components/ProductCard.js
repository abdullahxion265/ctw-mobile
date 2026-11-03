import { memo, useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Plus, Check } from 'lucide-react-native';
import { colors, fonts, radius, spacing, typography } from '../theme/theme';
import { getImageUrl } from '../utils/imageUrl';
import { priceFor, formatItemPrice } from '../utils/currency';
import ImagePlaceholder from './ImagePlaceholder';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = spacing.md;
export const CARD_WIDTH = Math.floor((SCREEN_WIDTH - spacing.lg * 2 - CARD_GAP) / 2);

/**
 * Product card: image, brand, name, price. `onAdd` shows the round "+"
 * quick-add button (like the web card); it should return true when the
 * item was added, which flips the button to a check for a moment.
 */
function ProductCard({ product, currency, onPress, onAdd, width = CARD_WIDTH, style }) {
  const [added, setAdded] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const uri = getImageUrl(product.image_url);
  const price = formatItemPrice(product, currency);
  const onRequest = priceFor(product, currency) === null;

  const handleAdd = () => {
    if (onAdd(product)) {
      setAdded(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setAdded(false), 1400);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { width }, style]}
      onPress={() => onPress(product)}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`${product.name} by ${product.brand}, ${price}`}
    >
      <View style={styles.imageWrap}>
        {uri ? (
          <Image source={{ uri }} style={styles.image} contentFit="cover" transition={220} cachePolicy="memory-disk" />
        ) : (
          <ImagePlaceholder style={styles.image} />
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[onRequest ? styles.priceRequest : styles.price, { flex: 1 }]} numberOfLines={1}>
            {price}
          </Text>
          {onAdd ? (
            <TouchableOpacity
              style={[styles.addBtn, added && styles.addBtnDone]}
              onPress={handleAdd}
              activeOpacity={0.8}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityLabel={`Add ${product.name} to cart`}
            >
              {added ? <Check size={16} color={colors.onGold} /> : <Plus size={16} color={colors.gold} />}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(ProductCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  imageWrap: { width: '100%', aspectRatio: 4 / 5, backgroundColor: colors.surfaceRaised },
  image: { width: '100%', height: '100%' },
  body: { padding: spacing.md, gap: 3 },
  brand: { ...typography.label, color: colors.gold, fontSize: 9.5 },
  name: { fontFamily: fonts.bodyMedium, fontSize: 13.5, lineHeight: 18, color: colors.textPrimary, minHeight: 36 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2, minHeight: 34 },
  price: { fontFamily: fonts.heading, fontSize: 16, color: colors.gold },
  priceRequest: { fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  addBtnDone: { backgroundColor: colors.gold },
});
