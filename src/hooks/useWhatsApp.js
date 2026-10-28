import { useState, useCallback } from 'react';
import { useConfig } from '../context/ConfigContext';
import { openWhatsApp } from '../utils/whatsapp';
import { hapticTap } from '../utils/haptics';
import ConfirmModal from '../components/ConfirmModal';

/**
 * Shared WhatsApp handoff for every screen that sends an order or a
 * message. Returns `sendWhatsApp(text)` and a `whatsappModal` element
 * the screen renders once; the modal appears only when the number is
 * not configured or neither WhatsApp nor the wa.me link could open.
 */
export function useWhatsApp() {
  const { whatsappNumber, whatsappReady } = useConfig();
  const [problem, setProblem] = useState(null);

  const sendWhatsApp = useCallback(
    async (text) => {
      hapticTap();
      if (!whatsappReady) {
        if (__DEV__) console.warn('[CTW] WHATSAPP_NUMBER is empty. Set it in src/config/env.js.');
        setProblem({
          title: 'Ordering is unavailable',
          message: __DEV__
            ? 'WHATSAPP_NUMBER is empty. Set it in src/config/env.js.'
            : 'We cannot take orders from the app right now. Please try again later.',
        });
        return false;
      }
      const opened = await openWhatsApp(whatsappNumber, text);
      if (!opened) {
        setProblem({
          title: "Couldn't open WhatsApp",
          message: 'Make sure WhatsApp is installed on this phone, then try again.',
        });
      }
      return opened;
    },
    [whatsappNumber, whatsappReady]
  );

  const whatsappModal = (
    <ConfirmModal
      visible={!!problem}
      title={problem?.title || ''}
      message={problem?.message}
      confirmLabel="OK"
      danger={false}
      single
      onConfirm={() => setProblem(null)}
      onCancel={() => setProblem(null)}
    />
  );

  return { sendWhatsApp, whatsappModal };
}
