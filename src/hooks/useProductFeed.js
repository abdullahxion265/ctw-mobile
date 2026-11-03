import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchProducts, fetchAllProducts, filterBySearch } from '../api/products';
import { isNetworkError } from '../api/client';
import { readCache, writeCache } from '../utils/cache';

const cacheKey = (category, brand) => `ctw.cache.products.${category}.${brand}`;
const EMPTY = { products: [], page: 0, totalPages: 1, status: 'loading', offline: false };

// Under a specific category, show only that category. Under "all", show
// everything the API returns — including a leftover "kids" row, which
// the shop only surfaces there.
const inCategory = (products, category) =>
  category === 'all' ? products : products.filter((p) => p.category === category);

/**
 * Product list for the Shop screen: first page, infinite scroll, pull to
 * refresh, search and the offline fallback.
 *
 * - No query: pages of 12 from GET /products, appended on scroll.
 * - Query: the full catalogue for the chosen category and brand (cached
 *   for 5 minutes) filtered on the device, because the server has no ?q= yet.
 * - If a load fails, the last good first page is served from the
 *   on-device cache with `offline: true`; only when there is nothing
 *   cached does the screen get status 'error'.
 */
export function useProductFeed({ category, brand = 'all', query }) {
  const [state, setState] = useState(EMPTY);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const requestId = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;
  const prevFilters = useRef(`${category}|${brand}`);

  const load = useCallback(
    async ({ refresh = false } = {}) => {
      const id = ++requestId.current;
      setBusy(true);
      try {
        let next;
        if (query) {
          const all = await fetchAllProducts({ category, brand, force: refresh });
          next = { products: inCategory(filterBySearch(all, query), category), page: 1, totalPages: 1 };
        } else {
          const res = await fetchProducts({ category, brand, page: 1 });
          next = { products: inCategory(res.products, category), page: res.page, totalPages: res.totalPages };
          writeCache(cacheKey(category, brand), next);
        }
        if (id !== requestId.current) return;
        setState({ ...next, status: 'ready', offline: false });
      } catch (err) {
        if (id !== requestId.current) return;
        const cached = await readCache(cacheKey(category, brand));
        if (id !== requestId.current) return;
        if (cached && Array.isArray(cached.products) && cached.products.length > 0) {
          const list = query ? filterBySearch(cached.products, query) : cached.products;
          setState({ products: list, page: 1, totalPages: 1, status: 'ready', offline: true });
        } else {
          setState({ ...EMPTY, status: 'error', offline: isNetworkError(err) });
        }
      } finally {
        if (id === requestId.current) {
          setBusy(false);
          setRefreshing(false);
        }
      }
    },
    [category, brand, query]
  );

  useEffect(() => {
    // A new category or brand starts from a clean skeleton; a new search
    // keeps the previous results on screen until the new ones arrive.
    const filters = `${category}|${brand}`;
    if (prevFilters.current !== filters) {
      prevFilters.current = filters;
      setState(EMPTY);
    }
    load();
  }, [load, category, brand]);

  const reload = useCallback(() => {
    setRefreshing(true);
    load({ refresh: true });
  }, [load]);

  const retry = useCallback(() => {
    setState((s) => ({ ...s, status: s.products.length ? s.status : 'loading' }));
    load();
  }, [load]);

  const loadMore = useCallback(async () => {
    const s = stateRef.current;
    if (query || loadingMore || s.status !== 'ready' || s.offline || s.page >= s.totalPages) return;
    const id = requestId.current;
    setLoadingMore(true);
    try {
      const res = await fetchProducts({ category, brand, page: s.page + 1 });
      if (id !== requestId.current) return;
      setState((prev) => {
        const seen = new Set(prev.products.map((p) => String(p.id)));
        const extra = inCategory(res.products, category).filter((p) => !seen.has(String(p.id)));
        return { ...prev, products: [...prev.products, ...extra], page: res.page, totalPages: res.totalPages };
      });
    } catch {
      // keep what is on screen; scrolling to the end again retries
    } finally {
      setLoadingMore(false);
    }
  }, [category, brand, query, loadingMore]);

  return {
    products: state.products,
    status: state.status,
    offline: state.offline,
    hasMore: state.page < state.totalPages,
    busy,
    refreshing,
    loadingMore,
    reload,
    retry,
    loadMore,
  };
}
