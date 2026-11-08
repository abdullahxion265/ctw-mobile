import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { MessageCircle, Globe, Coins, ChevronRight, ArrowUpRight, Truck, Mail } from 'lucide-react-native';
import { colors, fonts, radius, spacing, typography } from '../theme/theme';
import { useCurrency } from '../context/CurrencyContext';
import { useWhatsApp } from '../hooks/useWhatsApp';
import { useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import SocialIcon from '../components/SocialIcon';
import { SOCIAL_LINKS, DELIVERY, CONTACT_EMAIL } from '../config/store';
import { CURRENCIES } from '../utils/currency';
import { hapticSelect } from '../utils/haptics';
import { SITE_ORIGIN, APP_NAME, SHOP_NAME } from '../config/env';

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
  const [linkProblem, setLinkProblem] = useState(false);

  const openLink = (url) => {
    hapticSelect();
    Linking.openURL(url).catch(() => setLinkProblem(true));
  };

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxxl }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Image source={require('../../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
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
        <Text style={styles.sectionLabel}>Ordering</Text>
        <View style={styles.card}>
          <View style={[styles.fact, styles.rowBorder]}>
            <View style={styles.rowIcon}>
              <Truck size={19} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{DELIVERY.title}</Text>
              <Text style={styles.rowSub}>{DELIVERY.note}</Text>
            </View>
          </View>
          <View style={[styles.fact, styles.rowBorder]}>
            <View style={styles.rowIcon}>
              <MessageCircle size={19} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Order on WhatsApp</Text>
              <Text style={styles.rowSub}>Pick your items, send one message, and we confirm stock and payment with you.</Text>
            </View>
          </View>
          <View style={styles.fact}>
            <View style={styles.rowIcon}>
              <Mail size={19} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Questions? Email us</Text>
              <Text style={styles.rowSub}>For enquiries about orders, sizes or anything else.</Text>
              {/* Plain text on purpose, like the web; selectable so it can be copied. */}
              <Text style={styles.email} selectable>
                {CONTACT_EMAIL}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Follow Us</Text>
        <View style={styles.card}>
          {SOCIAL_LINKS.map((s, i) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.row, i < SOCIAL_LINKS.length - 1 && styles.rowBorder]}
              onPress={() => openLink(s.url)}
              activeOpacity={0.75}
              accessibilityRole="link"
              accessibilityLabel={`${s.label}: ${s.sub}`}
            >
              <View style={styles.rowIcon}>
                <SocialIcon id={s.id} size={19} color={colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{s.label}</Text>
                <Text style={styles.rowSub} numberOfLines={1}>
                  {s.sub}
                </Text>
              </View>
              <ArrowUpRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Contact</Text>
        <View style={styles.card}>
          <Row
            icon={<MessageCircle size={19} color={colors.gold} />}
            title="Chat on WhatsApp"
            subtitle="Questions, sizes, availability"
            onPress={() => sendWhatsApp(`Hi ${SHOP_NAME}! I have a question.`)}
          />
          <Row
            last
            icon={<Globe size={19} color={colors.gold} />}
            title="Visit the website"
            subtitle={SITE_ORIGIN.replace('https://', '')}
            onPress={() => openLink(SITE_ORIGIN)}
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
      <ConfirmModal
        visible={linkProblem}
        title="Couldn't open the link"
        message="Check your connection and try again."
        confirmLabel="OK"
        danger={false}
        single
        onConfirm={() => setLinkProblem(false)}
        onCancel={() => setLinkProblem(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  header: { alignItems: 'center', paddingVertical: spacing.xl },
  logo: { width: 64, height: 80, marginBottom: spacing.md },
  title: { fontFamily: fonts.heading, fontSize: 24, color: colors.textPrimary },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  sectionLabel: { ...typography.label, color: colors.gold, marginBottom: spacing.sm, marginLeft: 4 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  fact: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.lg },
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
  email: { fontFamily: fonts.bodyMedium, fontSize: 13.5, color: colors.textPrimary, marginTop: 6 },
  rowSub: { fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  aboutCard: { padding: spacing.lg, gap: spacing.md },
  aboutText: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 21, color: colors.textSecondary },
  version: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1.2, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxl },
});
