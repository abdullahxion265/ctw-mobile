import { View, Text, StyleSheet } from 'react-native';
import { Truck } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '../theme/theme';
import { DELIVERY } from '../config/store';

// The web's "Delivery available" reminder, shown next to ordering.
export default function DeliveryNote({ style }) {
  return (
    <View style={[styles.wrap, style]} accessible accessibilityLabel={`${DELIVERY.title}. ${DELIVERY.note}`}>
      <Truck size={17} color={colors.gold} style={{ marginTop: 1 }} />
      <Text style={styles.text}>
        <Text style={styles.title}>{DELIVERY.title}.</Text> {DELIVERY.note}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(212,175,55,0.06)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: { flex: 1, fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18, color: colors.textMuted },
  title: { fontFamily: fonts.bodyBold, color: colors.textPrimary },
});
