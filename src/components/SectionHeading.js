import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing, typography } from '../theme/theme';

export default function SectionHeading({ eyebrow, title, subtitle, style }) {
  return (
    <View style={[styles.wrap, style]}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  eyebrow: { ...typography.label, color: colors.gold, marginBottom: 8 },
  title: { fontFamily: fonts.heading, fontSize: 24, lineHeight: 30, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.body, fontSize: 13.5, color: colors.textMuted, marginTop: 6, lineHeight: 20 },
});
