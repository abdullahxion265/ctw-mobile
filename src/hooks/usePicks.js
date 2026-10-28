import { useState, useEffect, useCallback } from 'react';
import { fetchPicks } from '../api/products';
import { isNetworkError } from '../api/client';
import { readCache, writeCache } from '../utils/cache';

const KEY = 'ctw.cache.picks';

/** Three random products for the home screen, with an offline fallback. */
export function usePicks() {
  const [picks, setPicks] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [offline, setOffline] = useState(false);

  const load = useCallback(async () => {
    try {
      // A leftover kids row is only ever shown under "All" in the shop.
      const list = (await fetchPicks()).filter((p) => p.category !== 'kids');
      setPicks(list);
      setStatus('ready');
      setOffline(false);
      writeCache(KEY, list);
    } catch (err) {
      const cached = await readCache(KEY);
      if (Array.isArray(cached) && cached.length > 0) {
        setPicks(cached);
        setStatus('ready');
        setOffline(true);
      } else {
        setStatus('error');
        setOffline(isNetworkError(err));
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { picks, status, offline, reload: load };
}
