import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme/theme';

// Gold outline secondary button.
export default function OutlineButton({ label, onPress, icon, disabled, style, fullWidth = true, tone = 'gold' }) {
  const danger = tone === 'danger';
  return (
    <TouchableOpacity
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        { borderColor: danger ? colors.danger : colors.gold },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
    >
      <View style={styles.content}>
        {icon}
        <Text style={[styles.label, { color: danger ? colors.danger : colors.gold }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: radius.full,
    borderWidth: 1.5,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.5 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontFamily: fonts.bodyBold, fontSize: 15 },
});
