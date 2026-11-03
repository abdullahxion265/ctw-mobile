import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingBag, MessageCircle, X, Info } from 'lucide-react-native';
import { colors, fonts, radius, spacing, typography } from '../theme/theme';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useWhatsApp } from '../hooks/useWhatsApp';
import { computeTotals, buildOrderMessage, MAX_NOTES_LENGTH } from '../utils/cart';
import { formatMoney, CURRENCIES } from '../utils/currency';
import { hapticWarning } from '../utils/haptics';
import CartLine from '../components/CartLine';
import CurrencyPill from '../components/CurrencyPill';
import EmptyState from '../components/EmptyState';
import PrimaryButton from '../components/PrimaryButton';
import OutlineButton from '../components/OutlineButton';
import ConfirmModal from '../components/ConfirmModal';
import DeliveryNote from '../components/DeliveryNote';

export default function CartScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { currency } = useCurrency();
  const { items, notes, notices, setQuantity, removeItem, clearCart, setNotes, refreshCart, dismissNotices } = useCart();
  const { sendWhatsApp, whatsappModal } = useWhatsApp();
  const [confirmClear, setConfirmClear] = useState(false);
  const listRef = useRef(null);

  // Refresh snapshots against the live catalogue every time the cart opens.
  useFocusEffect(
    useCallback(() => {
      refreshCart();
    }, [refreshCart])
  );

  const { total, pricedLines, onRequestLines, units } = computeTotals(items, currency);
  const openProduct = (item) => navigation.navigate('ProductDetail', { id: item.id });

  const handleSend = () => sendWhatsApp(buildOrderMessage({ items, currency, notes }));

  const handleRemove = (id) => removeItem(id);

  const renderNotices = () =>
    notices.length > 0 ? (
      <View style={styles.noticeBox} accessibilityRole="alert">
        <Info size={16} color={colors.gold} style={{ marginTop: 2 }} />
        <View style={{ flex: 1, gap: 4 }}>
          {notices.map((n, i) => (
            <Text key={`${i}-${n}`} style={styles.noticeText}>
              {n}
            </Text>
          ))}
        </View>
        <TouchableOpacity onPress={dismissNotices} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" accessibilityLabel="Dismiss">
          <X size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    ) : null;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Cart</Text>
            {units > 0 ? (
              <Text style={styles.count}>
                {units} {units === 1 ? 'item' : 'items'}
              </Text>
            ) : null}
          </View>
          <View style={styles.headerRight}>
            {items.length > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  hapticWarning();
                  setConfirmClear(true);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
              >
                <Text style={styles.clear}>Clear</Text>
              </TouchableOpacity>
            ) : null}
            <CurrencyPill />
          </View>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyWrap}>
            {renderNotices()}
            <EmptyState
              icon={<ShoppingBag size={26} color={colors.gold} />}
              title="Your cart is empty"
              subtitle="Add something you like and send the whole order to us on WhatsApp."
              action={<OutlineButton label="Browse the shop" fullWidth={false} onPress={() => navigation.navigate('ShopTab', { category: 'all', ts: Date.now() })} />}
            />
          </View>
        ) : (
          <>
            <FlatList
              ref={listRef}
              data={items}
              keyExtractor={(i) => String(i.id)}
              renderItem={({ item }) => (
                <CartLine
                  item={item}
                  currency={currency}
                  onChangeQuantity={setQuantity}
                  onRemove={handleRemove}
                  onOpen={openProduct}
                />
              )}
              ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
              ListHeaderComponent={renderNotices()}
              ListFooterComponent={
                <View style={styles.notesBlock}>
                  <DeliveryNote style={{ marginBottom: spacing.lg }} />
                  <Text style={styles.notesLabel}>Sizes, colours, delivery area or notes</Text>
                  <TextInput
                    style={styles.notesInput}
                    value={notes}
                    onChangeText={setNotes}
                    onFocus={() => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 250)}
                    placeholder="e.g. Hoodie: L, black. Deliver to: your area"
                    placeholderTextColor={colors.textMuted}
                    multiline
                    maxLength={MAX_NOTES_LENGTH}
                    textAlignVertical="top"
                    selectionColor={colors.gold}
                    accessibilityLabel="Sizes, colours, delivery area or notes"
                  />
                  <Text style={styles.notesCount}>
                    {notes.length}/{MAX_NOTES_LENGTH}
                  </Text>
                </View>
              }
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.bar}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total ({currency})</Text>
                <Text style={styles.totalValue}>{pricedLines > 0 ? formatMoney(total, currency) : '—'}</Text>
              </View>
              {onRequestLines > 0 ? (
                <Text style={styles.onRequest}>
                  {onRequestLines} item{onRequestLines > 1 ? 's' : ''} priced on request in {CURRENCIES[currency].shortName}, not included above.
                </Text>
              ) : null}
              <PrimaryButton
                label="Send order on WhatsApp"
                onPress={handleSend}
                icon={<MessageCircle size={18} color={colors.onGold} />}
                style={{ marginTop: spacing.md }}
              />
            </View>
          </>
        )}

        <ConfirmModal
          visible={confirmClear}
          title="Clear your cart?"
          message="This removes every item and your note."
          confirmLabel="Clear cart"
          onConfirm={() => {
            clearCart();
            setConfirmClear(false);
          }}
          onCancel={() => setConfirmClear(false)}
        />
        {whatsappModal}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  title: { fontFamily: fonts.heading, fontSize: 30, color: colors.textPrimary },
  count: { ...typography.label, color: colors.textMuted, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  clear: { fontFamily: fonts.bodyMedium, fontSize: 13.5, color: colors.textMuted },
  emptyWrap: { flex: 1, justifyContent: 'center', paddingBottom: spacing.xxxl, paddingHorizontal: spacing.lg },
  listContent: { padding: spacing.lg, paddingBottom: spacing.xl },
  noticeBox: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.notice,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  noticeText: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  notesBlock: { marginTop: spacing.xl },
  notesLabel: { ...typography.label, color: colors.gold, marginBottom: spacing.sm },
  notesInput: {
    minHeight: 92,
    maxHeight: 160,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    fontFamily: fonts.body,
    fontSize: 14.5,
    lineHeight: 21,
    color: colors.textPrimary,
  },
  notesCount: { fontFamily: fonts.mono, fontSize: 10.5, color: colors.textMuted, textAlign: 'right', marginTop: 6 },
  bar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  totalLabel: { ...typography.label, color: colors.textMuted },
  totalValue: { fontFamily: fonts.heading, fontSize: 26, color: colors.gold },
  onRequest: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.textMuted, marginTop: 4 },
});
