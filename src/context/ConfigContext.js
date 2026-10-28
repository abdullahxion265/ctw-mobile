import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import { WHATSAPP_NUMBER } from '../config/env';
import { isValidWhatsAppNumber } from '../utils/whatsappUrl';

const STORAGE_KEY = 'ctw.config';
const ConfigContext = createContext(null);

/**
 * Shop config the app can change without a store release. Today only
 * the WhatsApp number. Resolution order:
 *   1. GET /api/config (not built yet — handoff doc, section 9)
 *   2. the last value that endpoint returned, kept in AsyncStorage
 *   3. WHATSAPP_NUMBER baked into config/env.js
 * A missing endpoint, an HTML fallback page or any other malformed
 * answer is ignored silently and the next source is used.
 */
export function ConfigProvider({ children }) {
  const [whatsappNumber, setWhatsappNumber] = useState(WHATSAPP_NUMBER);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stored = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY)) || 'null');
        if (active && stored && isValidWhatsAppNumber(stored.whatsapp_number)) {
          setWhatsappNumber(String(stored.whatsapp_number));
        }
      } catch {
        // ignore
      }
      try {
        const { data } = await api.get('/config');
        if (data && typeof data === 'object' && isValidWhatsAppNumber(data.whatsapp_number)) {
          if (active) setWhatsappNumber(String(data.whatsapp_number));
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ whatsapp_number: String(data.whatsapp_number) }));
        }
      } catch {
        // endpoint not deployed yet, or offline — keep the fallback
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({ whatsappNumber, whatsappReady: isValidWhatsAppNumber(whatsappNumber) }),
    [whatsappNumber]
  );
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export const useConfig = () => {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used inside ConfigProvider');
  return ctx;
};
