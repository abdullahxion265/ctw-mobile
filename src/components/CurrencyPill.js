import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { colors, fonts, radius } from '../theme/theme';
import { useCurrency } from '../context/CurrencyContext';
import { CURRENCIES } from '../utils/currency';
import { hapticSelect } from '../utils/haptics';

// Header control that opens the currency sheet. Shows e.g. "ZAR  R".
export default function CurrencyPill({ style }) {
  const { currency, openSheet } = useCurrency();
  const { code, symbol, name } = CURRENCIES[currency];
  return (
    <TouchableOpacity
      style={[styles.pill, style]}
      onPress={() => {
        hapticSelect();
        openSheet();
      }}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Currency: ${name}. Tap to change.`}
    >
      <Text style={styles.code}>{code}</Text>
      <Text style={styles.symbol}>{symbol}</Text>
      <ChevronDown size={14} color={colors.gold} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  code: { fontFamily: fonts.mono, fontSize: 11.5, letterSpacing: 1.2, color: colors.textPrimary },
  symbol: { fontFamily: fonts.heading, fontSize: 13, color: colors.gold },
});
