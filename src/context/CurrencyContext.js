import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CURRENCY } from '../config/store';
import { isCurrencyCode } from '../utils/currency';

const STORAGE_KEY = 'ctw.currency';
const CurrencyContext = createContext(null);

/**
 * The shopper's currency (ZAR or MWK). Remembered across launches,
 * defaults to Rand, and applied everywhere at once because every price
 * on screen reads it from here. The switch sheet is controlled from
 * here too, so any screen can open it with openSheet().
 */
export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);
  const [loaded, setLoaded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (isCurrencyCode(stored)) setCurrencyState(stored);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const setCurrency = useCallback((code) => {
    if (!isCurrencyCode(code)) return;
    setCurrencyState(code);
    AsyncStorage.setItem(STORAGE_KEY, code).catch(() => {});
  }, []);

  const openSheet = useCallback(() => setSheetOpen(true), []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const value = useMemo(
    () => ({ currency, setCurrency, loaded, sheetOpen, openSheet, closeSheet }),
    [currency, setCurrency, loaded, sheetOpen, openSheet, closeSheet]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider');
  return ctx;
};
