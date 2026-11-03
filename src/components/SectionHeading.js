import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing, typography } from '../theme/theme';

export default function SectionHeading({ eyebrow, title, subtitle, action, style }) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          {title ? <Text style={styles.title}>{title}</Text> : null}
        </View>
        {action}
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md },
  eyebrow: { ...typography.label, color: colors.gold, marginBottom: 8 },
  title: { fontFamily: fonts.heading, fontSize: 24, lineHeight: 30, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.body, fontSize: 13.5, color: colors.textMuted, marginTop: 6, lineHeight: 20 },
});
