import { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { colors, fonts, radius, spacing, typography } from '../theme/theme';
import { getImageUrl } from '../utils/imageUrl';
import { priceFor, formatItemPrice } from '../utils/currency';
import { BRAND_LABEL } from '../config/env';
import ImagePlaceholder from './ImagePlaceholder';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = spacing.md;
export const CARD_WIDTH = Math.floor((SCREEN_WIDTH - spacing.lg * 2 - CARD_GAP) / 2);

function ProductCard({ product, currency, onPress, width = CARD_WIDTH, style }) {
  const uri = getImageUrl(product.image_url);
  const price = formatItemPrice(product, currency);
  const onRequest = priceFor(product, currency) === null;

  return (
    <TouchableOpacity
      style={[styles.card, { width }, style]}
      onPress={() => onPress(product)}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${price}`}
    >
      <View style={styles.imageWrap}>
        {uri ? (
          <Image source={{ uri }} style={styles.image} contentFit="cover" transition={220} cachePolicy="memory-disk" />
        ) : (
          <ImagePlaceholder style={styles.image} />
        )}
      </View>
      <View style={styles.body}>
        {/* Always CTW: every product is sold under one brand, no brand field exists. */}
        <Text style={styles.tag}>{BRAND_LABEL}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={onRequest ? styles.priceRequest : styles.price} numberOfLines={1}>
          {price}
        </Text>
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
  tag: { ...typography.label, color: colors.gold, fontSize: 9.5 },
  name: { fontFamily: fonts.bodyMedium, fontSize: 13.5, lineHeight: 18, color: colors.textPrimary, minHeight: 36 },
  price: { fontFamily: fonts.heading, fontSize: 16, color: colors.gold, marginTop: 2 },
  priceRequest: { fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted, marginTop: 4 },
});
