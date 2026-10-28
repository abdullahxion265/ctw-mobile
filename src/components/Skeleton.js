import { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';
import { CARD_WIDTH } from './ProductCard';

// A pulsing block. Native-driven, so it stays smooth while the JS
// thread is busy parsing the response it is standing in for.
export default function Skeleton({ style }) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[{ backgroundColor: colors.surfaceRaised, opacity }, style]} />;
}

export function ProductCardSkeleton({ width = CARD_WIDTH }) {
  return (
    <View style={[styles.card, { width }]}>
      <Skeleton style={{ width: '100%', aspectRatio: 4 / 5 }} />
      <View style={styles.body}>
        <Skeleton style={{ width: 28, height: 8, borderRadius: 4 }} />
        <Skeleton style={{ width: '85%', height: 12, borderRadius: 6 }} />
        <Skeleton style={{ width: '45%', height: 14, borderRadius: 6, marginTop: 4 }} />
      </View>
    </View>
  );
}

export function ProductGridSkeleton({ count = 6 }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.md,
  },
  body: { padding: spacing.md, gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
});
