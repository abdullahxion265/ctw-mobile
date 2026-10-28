import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme/theme';

// Stand-in for products whose image_url is null (the API allows it) or
// whose image has not loaded.
export default function ImagePlaceholder({ style }) {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.mark}>CTW</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  mark: { fontFamily: fonts.heading, fontSize: 22, color: colors.gold, opacity: 0.35, letterSpacing: 2 },
});
