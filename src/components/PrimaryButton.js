import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radius, spacing, shadow } from '../theme/theme';

// Gold gradient primary button (web: "gold gradient primary button").
export default function PrimaryButton({ label, onPress, icon, loading, disabled, style, fullWidth = true }) {
  const inactive = disabled || loading;
  return (
    <TouchableOpacity
      style={[styles.shadow, fullWidth && styles.fullWidth, inactive && styles.disabled, style]}
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!inactive }}
    >
      <LinearGradient
        colors={[colors.goldLight, colors.gold, colors.goldMuted]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator color={colors.onGold} size="small" />
        ) : (
          <View style={styles.content}>
            {icon}
            <Text style={styles.label} numberOfLines={1}>
              {label}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shadow: { borderRadius: radius.full, ...shadow.gold },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.5 },
  button: {
    minHeight: 50,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { color: colors.onGold, fontFamily: fonts.bodyBold, fontSize: 15 },
});
