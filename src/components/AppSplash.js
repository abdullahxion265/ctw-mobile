import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../theme/theme';
import { APP_TAGLINE } from '../config/env';

/**
 * Shown right after the native splash hands off to JS: same dark
 * background, then the full CTW logo (monogram + CARTER / THE TOWN WEAR)
 * and the tagline. Rendered only once the fonts are loaded, so the text
 * never flashes in a fallback face.
 */
export default function AppSplash({ onLayout }) {
  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <Image source={require('../../assets/logo-full.png')} style={styles.logo} resizeMode="contain" />
      <View style={styles.rule} />
      <Text style={styles.motto}>{APP_TAGLINE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 230, height: 186 },
  rule: { width: 36, height: 1, backgroundColor: colors.gold, marginVertical: spacing.lg, opacity: 0.7 },
  motto: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2.2, color: colors.gold, textTransform: 'uppercase' },
});
