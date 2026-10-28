import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';

// Centered spinner for full-screen first loads (the lists use skeletons).
export default function LoadingBlock() {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.gold} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
