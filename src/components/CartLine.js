import { memo, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Swipeable } from 'react-native-gesture-handler';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { colors, fonts, radius, spacing, typography } from '../theme/theme';
import { getImageUrl } from '../utils/imageUrl';
import { formatItemPrice, formatMoney, priceFor } from '../utils/currency';
import { lineTotal, MAX_QTY, MIN_QTY } from '../utils/cart';
import { BRAND_LABEL } from '../config/env';
import { hapticTap, hapticWarning } from '../utils/haptics';
import ImagePlaceholder from './ImagePlaceholder';

/**
 * One cart line: image, name, unit price, quantity stepper, line total.
 * Swipe left to delete; the trash button does the same for anyone who
 * cannot or does not want to swipe. Haptic tick on every quantity change.
 */
function CartLine({ item, currency, onChangeQuantity, onRemove, onOpen }) {
  const swipeRef = useRef(null);
  const uri = getImageUrl(item.image_url);
  const total = lineTotal(item, currency);
  const onRequest = priceFor(item, currency) === null;

  const step = (delta) => {
    const next = item.quantity + delta;
    if (next < MIN_QTY || next > MAX_QTY) {
      hapticWarning();
      return;
    }
    hapticTap();
    onChangeQuantity(item.id, next);
  };

  const remove = () => {
    hapticWarning();
    onRemove(item.id);
  };

  return (
    <Swipeable
      ref={swipeRef}
      overshootRight={false}
      friction={2}
      rightThreshold={56}
      onSwipeableOpen={remove}
      renderRightActions={() => (
        <View style={styles.swipeAction}>
          <Trash2 size={20} color={colors.danger} />
          <Text style={styles.swipeText}>Remove</Text>
        </View>
      )}
    >
      <View style={styles.row}>
        <TouchableOpacity onPress={() => onOpen(item)} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`Open ${item.name}`}>
          <View style={styles.imageWrap}>
            {uri ? (
              <Image source={{ uri }} style={styles.image} contentFit="cover" transition={200} cachePolicy="memory-disk" />
            ) : (
              <ImagePlaceholder style={styles.image} />
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.info}>
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tag}>{BRAND_LABEL}</Text>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={remove}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${item.name}`}
            >
              <Trash2 size={17} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={onRequest ? styles.unitRequest : styles.unit}>
            {onRequest ? formatItemPrice(item, currency) : `${formatMoney(priceFor(item, currency), currency)} each`}
          </Text>

          <View style={styles.bottomRow}>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={[styles.stepBtn, item.quantity <= MIN_QTY && styles.stepBtnOff]}
                onPress={() => step(-1)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 4 }}
                accessibilityRole="button"
                accessibilityLabel={`Decrease quantity of ${item.name}`}
              >
                <Minus size={15} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.qty} accessibilityLabel={`Quantity ${item.quantity}`}>
                {item.quantity}
              </Text>
              <TouchableOpacity
                style={[styles.stepBtn, item.quantity >= MAX_QTY && styles.stepBtnOff]}
                onPress={() => step(1)}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 6 }}
                accessibilityRole="button"
                accessibilityLabel={`Increase quantity of ${item.name}`}
              >
                <Plus size={15} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {total !== null ? <Text style={styles.total}>{formatMoney(total, currency)}</Text> : null}
          </View>
        </View>
      </View>
    </Swipeable>
  );
}

export default memo(CartLine);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  imageWrap: { width: 80, height: 100, borderRadius: radius.sm, overflow: 'hidden', backgroundColor: colors.surfaceRaised },
  image: { width: '100%', height: '100%' },
  info: { flex: 1, justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', gap: spacing.sm },
  tag: { ...typography.label, color: colors.gold, fontSize: 9.5, marginBottom: 2 },
  name: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 19, color: colors.textPrimary },
  unit: { fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  unitRequest: { fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted, marginTop: 2, fontStyle: 'italic' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bg,
  },
  stepBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  stepBtnOff: { opacity: 0.3 },
  qty: { minWidth: 26, textAlign: 'center', fontFamily: fonts.mono, fontSize: 14, color: colors.textPrimary },
  total: { fontFamily: fonts.heading, fontSize: 16, color: colors.gold },
  swipeAction: {
    width: 92,
    marginLeft: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  swipeText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.danger },
});
