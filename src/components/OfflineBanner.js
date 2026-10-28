import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '../theme/theme';

// Shown above a list that is being served from the on-device cache.
export default function OfflineBanner({ onRetry, label = "You're offline. Showing saved products." }) {
  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <WifiOff size={15} color={colors.gold} />
      <Text style={styles.text}>{label}</Text>
      {onRetry ? (
        <TouchableOpacity onPress={onRetry} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button">
          <Text style={styles.retry}>Retry</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.notice,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  text: { flex: 1, fontFamily: fonts.body, fontSize: 12.5, color: colors.textSecondary },
  retry: { fontFamily: fonts.bodyBold, fontSize: 12.5, color: colors.gold },
});
