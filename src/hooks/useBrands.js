import { useState, useEffect, useCallback } from 'react';
import { fetchBrands } from '../api/products';
import { readCache, writeCache } from '../utils/cache';

const KEY = 'ctw.cache.brands';

/**
 * Distinct brands for the Shop brand filter (GET /products/brands),
 * cached so the filter still shows offline. A failure is not an error
 * screen: with no list, the brand row simply is not shown.
 */
export function useBrands() {
  const [brands, setBrands] = useState([]);

  const load = useCallback(async () => {
    try {
      const list = await fetchBrands();
      setBrands(list);
      writeCache(KEY, list);
    } catch {
      const cached = await readCache(KEY);
      if (Array.isArray(cached)) setBrands(cached);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { brands, reloadBrands: load };
}
