import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../theme/theme';

/**
 * Shown right after the native splash hands off to JS: same dark
 * background and monogram, so the swap is seamless, plus real text
 * (the native splash is image + colour only). Rendered only once the
 * fonts are loaded, so the wordmark never flashes in a fallback face.
 */
export default function AppSplash({ onLayout }) {
  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.wordmark}>Carter The Town Wear</Text>
      <View style={styles.rule} />
      <Text style={styles.motto}>Order on WhatsApp</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 140, height: 140, marginBottom: spacing.sm },
  wordmark: { fontFamily: fonts.heading, fontSize: 24, color: colors.textPrimary },
  rule: { width: 36, height: 1, backgroundColor: colors.gold, marginVertical: spacing.md, opacity: 0.7 },
  motto: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2.2, color: colors.gold, textTransform: 'uppercase' },
});
