import { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Pressable, TouchableOpacity, Animated, PanResponder, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { colors, fonts, radius, spacing, shadow, typography } from '../theme/theme';
import { useCurrency } from '../context/CurrencyContext';
import { CURRENCIES, CURRENCY_CODES } from '../utils/currency';
import { hapticSelect } from '../utils/haptics';

const OFFSCREEN = 420;

/**
 * Bottom sheet for switching currency. Mounted once in the app shell and
 * opened from anywhere via useCurrency().openSheet(). Slides up, closes
 * on backdrop tap, Android back, or by dragging the handle down.
 */
export default function CurrencySheet() {
  const { sheetOpen, closeSheet, currency, setCurrency } = useCurrency();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(false);
  const translateY = useRef(new Animated.Value(OFFSCREEN)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const closeRef = useRef(closeSheet);
  closeRef.current = closeSheet;

  useEffect(() => {
    if (sheetOpen) {
      setMounted(true);
      translateY.setValue(OFFSCREEN);
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 0, speed: 16 }),
        Animated.timing(backdrop, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: OFFSCREEN, duration: 190, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 0, duration: 190, useNativeDriver: true }),
      ]).start(() => setMounted(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetOpen]);

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 70 || g.vy > 0.9) {
          closeRef.current();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
        }
      },
    })
  ).current;

  const choose = (code) => {
    if (code !== currency) hapticSelect();
    setCurrency(code);
    closeSheet();
  };

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={closeSheet} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdrop }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} accessibilityLabel="Close" />
        </Animated.View>

        <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl, transform: [{ translateY }] }]}>
          <View {...pan.panHandlers} style={styles.dragZone}>
            <View style={styles.handle} />
            <Text style={styles.eyebrow}>Currency</Text>
            <Text style={styles.title}>Show prices in</Text>
          </View>

          {CURRENCY_CODES.map((code) => {
            const { symbol, name } = CURRENCIES[code];
            const active = code === currency;
            return (
              <TouchableOpacity
                key={code}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => choose(code)}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={name}
              >
                <View style={styles.symbolBox}>
                  <Text style={styles.symbol}>{symbol}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionName}>{name}</Text>
                  <Text style={styles.optionCode}>{code}</Text>
                </View>
                {active ? <Check size={20} color={colors.gold} /> : null}
              </TouchableOpacity>
            );
          })}

          <Text style={styles.note}>
            Each product has its own price in both currencies. There is no conversion, and your choice is remembered.
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: colors.backdrop },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    ...shadow.raised,
  },
  dragZone: { paddingTop: spacing.md, paddingBottom: spacing.md },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderSubtle, marginBottom: spacing.lg },
  eyebrow: { ...typography.label, color: colors.gold, marginBottom: 6 },
  title: { fontFamily: fonts.heading, fontSize: 22, color: colors.textPrimary },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginTop: spacing.sm,
  },
  optionActive: { borderColor: colors.gold, backgroundColor: colors.notice },
  symbolBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: { fontFamily: fonts.heading, fontSize: 16, color: colors.gold },
  optionName: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.textPrimary },
  optionCode: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.2, color: colors.textMuted, marginTop: 2 },
  note: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.textMuted, marginTop: spacing.lg },
});
