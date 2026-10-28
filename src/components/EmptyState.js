import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../theme/theme';

export default function EmptyState({ icon, title, subtitle, action }) {
  return (
    <View style={styles.wrap}>
      {icon ? <View style={styles.iconCircle}>{icon}</View> : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64, paddingHorizontal: spacing.xxl },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { fontFamily: fonts.heading, fontSize: 20, color: colors.textPrimary, marginBottom: 8, textAlign: 'center' },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
});
