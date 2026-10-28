import { parsePrice } from './currency';
import { CATEGORY_LABELS } from '../config/store';

/**
 * Normalises a product from the API into what the app uses everywhere.
 * - prices become numbers (or null); `price` is a legacy mirror of the
 *   Kwacha price and is kept only so cart snapshots match the web shape
 * - `brand` is dropped on purpose: every product is sold under CTW and
 *   the UI never shows a brand field
 */
export function normalizeProduct(raw) {
  return {
    id: raw.id,
    name: String(raw.name ?? ''),
    category: String(raw.category ?? '').toLowerCase(),
    description: raw.description ? String(raw.description) : '',
    image_url: raw.image_url || null,
    price: parsePrice(raw.price),
    price_mwk: parsePrice(raw.price_mwk),
    price_zar: parsePrice(raw.price_zar),
    created_at: raw.created_at || null,
  };
}

export function categoryLabel(slug) {
  if (!slug) return '';
  return CATEGORY_LABELS[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
}
