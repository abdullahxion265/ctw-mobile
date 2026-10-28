import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { MessageCircle, Globe, Coins, ChevronRight } from 'lucide-react-native';
import { colors, fonts, radius, spacing, typography } from '../theme/theme';
import { useCurrency } from '../context/CurrencyContext';
import { useWhatsApp } from '../hooks/useWhatsApp';
import { CURRENCIES } from '../utils/currency';
import { hapticSelect } from '../utils/haptics';
import { SITE_ORIGIN, APP_NAME } from '../config/env';

function Row({ icon, title, subtitle, onPress, last }) {
  return (
    <TouchableOpacity
      style={[styles.row, !last && styles.rowBorder]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
    >
      <View style={styles.rowIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      <ChevronRight size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const { currency, openSheet } = useCurrency();
  const { sendWhatsApp, whatsappModal } = useWhatsApp();
  const { name, symbol } = CURRENCIES[currency];
  const version = Constants.expoConfig?.version;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxxl }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>{APP_NAME}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.card}>
          <Row
            last
            icon={<Coins size={19} color={colors.gold} />}
            title="Currency"
            subtitle={`${name} (${symbol})`}
            onPress={() => {
              hapticSelect();
              openSheet();
            }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Contact</Text>
        <View style={styles.card}>
          <Row
            icon={<MessageCircle size={19} color={colors.gold} />}
            title="Chat on WhatsApp"
            subtitle="Questions, sizes, availability"
            onPress={() => sendWhatsApp('Hi CTW! I have a question.')}
          />
          <Row
            last
            icon={<Globe size={19} color={colors.gold} />}
            title="Visit the website"
            subtitle={SITE_ORIGIN.replace('https://', '')}
            onPress={() => Linking.openURL(SITE_ORIGIN).catch(() => {})}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>About</Text>
        <View style={[styles.card, styles.aboutCard]}>
          <Text style={styles.aboutText}>
            Carter The Town Wear (CTW) is a clothing brand. Browse Men, Women, Hoodies, Caps and Shoes, build a cart,
            and send your order to us on WhatsApp. Availability and payment are agreed with us in the chat.
          </Text>
          <Text style={styles.aboutText}>
            Prices are shown in South African Rand or Malawian Kwacha. Each product has its own price in both, so
            switching currency never converts anything.
          </Text>
        </View>
      </View>

      {version ? <Text style={styles.version}>Version {version}</Text> : null}
      {whatsappModal}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  header: { alignItems: 'center', paddingVertical: spacing.xl },
  logo: { width: 96, height: 96, marginBottom: spacing.sm },
  title: { fontFamily: fonts.heading, fontSize: 24, color: colors.textPrimary },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  sectionLabel: { ...typography.label, color: colors.gold, marginBottom: spacing.sm, marginLeft: 4 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontFamily: fonts.bodyBold, fontSize: 14.5, color: colors.textPrimary },
  rowSub: { fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  aboutCard: { padding: spacing.lg, gap: spacing.md },
  aboutText: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 21, color: colors.textSecondary },
  version: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1.2, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxl },
});
