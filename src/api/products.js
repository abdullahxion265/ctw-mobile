import api, { BadResponseError } from './client';
import { normalizeProduct } from '../utils/product';
import { PAGE_SIZE } from '../config/store';

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function parseList(data, fallbackPage) {
  // Never assume the body is JSON: a proxy can return an HTML string.
  if (!isObject(data) || !Array.isArray(data.products)) throw new BadResponseError();
  const pagination = isObject(data.pagination) ? data.pagination : {};
  const products = data.products.filter((p) => isObject(p) && p.id !== undefined).map(normalizeProduct);
  return {
    products,
    page: Number(pagination.page) || fallbackPage,
    totalPages: Math.max(1, Number(pagination.totalPages) || 1),
    total: Number(pagination.total) || products.length,
  };
}

/** GET /products — one page. category 'all' (or empty) means no filter. */
export async function fetchProducts({ category = 'all', page = 1, limit = PAGE_SIZE } = {}) {
  const params = { limit };
  if (category && category !== 'all') params.category = category;
  if (page > 1) params.page = page;
  const { data } = await api.get('/products', { params });
  return parseList(data, page);
}

/** GET /products/picks — three random products for the home screen. */
export async function fetchPicks() {
  const { data } = await api.get('/products/picks');
  const list = Array.isArray(data) ? data : data?.products;
  if (!Array.isArray(list)) throw new BadResponseError();
  return list.filter((p) => isObject(p) && p.id !== undefined).map(normalizeProduct);
}

/** GET /products/:id */
export async function fetchProduct(id) {
  const { data } = await api.get(`/products/${encodeURIComponent(id)}`);
  const raw = isObject(data?.product) ? data.product : data;
  if (!isObject(raw) || raw.id === undefined) throw new BadResponseError();
  return normalizeProduct(raw);
}

/** GET /products?ids=...&limit=50 — used to refresh cart snapshots. */
export async function fetchProductsByIds(ids) {
  const unique = [...new Set(ids.map(String))].slice(0, 50);
  if (unique.length === 0) return [];
  const { data } = await api.get('/products', { params: { ids: unique.join(','), limit: 50 } });
  return parseList(data, 1).products;
}

/**
 * Every product, optionally within one category, by walking the pages.
 * The server has no ?q= search yet (handoff doc, section 9), so search
 * runs client-side over the full list — otherwise it would only ever
 * filter the pages already scrolled into view. Swap this for a ?q= call
 * once the server supports it.
 */
const ALL_TTL_MS = 5 * 60 * 1000;
const allCache = new Map();

export async function fetchAllProducts({ category = 'all', force = false } = {}) {
  const key = category || 'all';
  const hit = allCache.get(key);
  if (!force && hit && Date.now() - hit.at < ALL_TTL_MS) return hit.products;

  const first = await fetchProducts({ category: key, page: 1, limit: 50 });
  const products = [...first.products];
  for (let page = 2; page <= first.totalPages && page <= 20; page += 1) {
    const next = await fetchProducts({ category: key, page, limit: 50 });
    products.push(...next.products);
  }
  allCache.set(key, { at: Date.now(), products });
  return products;
}

export function filterBySearch(products, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return products;
  return products.filter(
    (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.includes(q)
  );
}
