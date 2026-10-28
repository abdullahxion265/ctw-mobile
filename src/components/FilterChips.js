import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme/theme';
import { hapticSelect } from '../utils/haptics';

// Gold pill filters, horizontally scrollable.
export default function FilterChips({ options, activeValue, onChange, style }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.row, style]}
    >
      {options.map((opt) => {
        const active = opt.value === activeValue;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => {
              if (!active) hapticSelect();
              onChange(opt.value);
            }}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingRight: spacing.lg },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  chipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  label: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textSecondary },
  labelActive: { color: colors.onGold, fontFamily: fonts.bodyBold },
});
