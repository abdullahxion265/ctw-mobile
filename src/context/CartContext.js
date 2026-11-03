import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchProductsByIds } from '../api/products';
import {
  addToCart,
  setQuantity as setLineQuantity,
  removeFromCart,
  mergeFreshProducts,
  removedNotice,
  hydrateCart,
  sanitizeNotes,
  countUnits,
} from '../utils/cart';

const STORAGE_KEY = 'ctw.cart.v1';
const CartContext = createContext(null);

/**
 * Wires the pure cart rules (utils/cart.js) to storage and the API.
 * - the cart and its note survive app restarts (AsyncStorage)
 * - the stored lines are only a snapshot: refreshCart() re-reads them
 *   from GET /products?ids=... on app start and whenever the cart opens
 * - a network or parsing failure during refresh is ignored and the
 *   cart is left exactly as it was
 */
export function CartProvider({ children }) {
  const [items, setItemsState] = useState([]);
  const [notes, setNotesState] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [notices, setNotices] = useState([]);

  // Refs mirror state so async work (refresh after a network round
  // trip) merges into the *current* cart, not the one it started with.
  const itemsRef = useRef(items);
  const notesRef = useRef(notes);
  const refreshing = useRef(false);
  const saveTimer = useRef(null);

  const persist = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ items: itemsRef.current, notes: notesRef.current })).catch(() => {});
    }, 300);
  }, []);

  const commitItems = useCallback(
    (next) => {
      itemsRef.current = next;
      setItemsState(next);
      persist();
    },
    [persist]
  );

  const refreshCart = useCallback(async () => {
    if (refreshing.current || itemsRef.current.length === 0) return;
    refreshing.current = true;
    try {
      const fresh = await fetchProductsByIds(itemsRef.current.map((i) => i.id));
      const { items: merged, removed } = mergeFreshProducts(itemsRef.current, fresh);
      commitItems(merged);
      if (removed.length > 0) {
        setNotices((prev) => [...prev, removedNotice(removed)]);
      }
    } catch {
      // offline, timeout or malformed body: keep the cart as is
    } finally {
      refreshing.current = false;
    }
  }, [commitItems]);

  // Load the saved cart once, then refresh it against the live catalogue.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY)) || 'null');
        const saved = hydrateCart(raw);
        if (active) {
          itemsRef.current = saved.items;
          notesRef.current = saved.notes;
          setItemsState(saved.items);
          setNotesState(saved.notes);
        }
      } catch {
        // corrupt storage: start with an empty cart
      }
      if (active) {
        setHydrated(true);
        refreshCart();
      }
    })();
    return () => {
      active = false;
      clearTimeout(saveTimer.current);
    };
  }, [refreshCart]);

  const addItem = useCallback(
    (product, quantity = 1) => {
      const result = addToCart(itemsRef.current, product, quantity);
      if (result.items !== itemsRef.current) commitItems(result.items);
      return result.status; // 'added' | 'increased' | 'max_qty' | 'cart_full'
    },
    [commitItems]
  );

  const setQuantity = useCallback(
    (id, quantity) => commitItems(setLineQuantity(itemsRef.current, id, quantity)),
    [commitItems]
  );

  const removeItem = useCallback((id) => commitItems(removeFromCart(itemsRef.current, id)), [commitItems]);

  const clearCart = useCallback(() => {
    notesRef.current = '';
    setNotesState('');
    commitItems([]);
  }, [commitItems]);

  const setNotes = useCallback(
    (text) => {
      const clean = sanitizeNotes(text);
      notesRef.current = clean;
      setNotesState(clean);
      persist();
    },
    [persist]
  );

  const dismissNotices = useCallback(() => setNotices([]), []);

  const value = useMemo(
    () => ({
      items,
      notes,
      hydrated,
      notices,
      units: countUnits(items),
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      setNotes,
      refreshCart,
      dismissNotices,
    }),
    [items, notes, hydrated, notices, addItem, setQuantity, removeItem, clearCart, setNotes, refreshCart, dismissNotices]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
