import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { AlertTriangle, Info } from 'lucide-react-native';
import { colors, fonts, spacing, radius, shadow } from '../theme/theme';

/**
 * In-app replacement for Alert.alert(), styled to the brand instead of
 * the OS dialog (same idea as the Zakumunda ConfirmModal).
 *
 * `single` renders one button — an acknowledgement rather than a choice.
 *
 * <ConfirmModal
 *   visible={open}
 *   title="Clear your cart?"
 *   message="This removes every item and your note."
 *   confirmLabel="Clear cart"
 *   onConfirm={() => { clearCart(); setOpen(false); }}
 *   onCancel={() => setOpen(false)}
 * />
 */
export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  single = false,
  onConfirm,
  onCancel,
}) {
  const Icon = danger ? AlertTriangle : Info;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.iconCircle, danger && styles.iconCircleDanger]}>
            <Icon size={22} color={danger ? colors.danger : colors.gold} />
          </View>
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}
          <View style={styles.actions}>
            {!single && (
              <TouchableOpacity style={styles.btnGhost} onPress={onCancel} activeOpacity={0.75} accessibilityRole="button">
                <Text style={styles.btnGhostText}>{cancelLabel}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.btnSolid, danger ? styles.btnDanger : styles.btnGold]}
              onPress={onConfirm}
              activeOpacity={0.85}
              accessibilityRole="button"
            >
              <Text style={[styles.btnSolidText, !danger && { color: colors.onGold }]}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.backdrop, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    alignItems: 'center',
    ...shadow.raised,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.notice,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  iconCircleDanger: { backgroundColor: colors.dangerBg },
  title: { fontFamily: fonts.heading, fontSize: 19, color: colors.textPrimary, marginBottom: 6, textAlign: 'center' },
  message: { fontFamily: fonts.body, fontSize: 13.5, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.xl },
  actions: { flexDirection: 'row', gap: spacing.md, width: '100%' },
  btnGhost: { flex: 1, paddingVertical: 13, borderRadius: radius.full, alignItems: 'center', borderWidth: 1.5, borderColor: colors.borderSubtle },
  btnGhostText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.textSecondary },
  btnSolid: { flex: 1, paddingVertical: 13, borderRadius: radius.full, alignItems: 'center' },
  btnDanger: { backgroundColor: colors.danger },
  btnGold: { backgroundColor: colors.gold },
  btnSolidText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.textPrimary },
});
