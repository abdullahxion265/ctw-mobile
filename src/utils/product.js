import { parsePrice } from './currency';
import { CATEGORY_LABELS, DEFAULT_BRAND } from '../config/store';

/**
 * Normalises a product from the API into what the app uses everywhere.
 * Prices become numbers (or null). `price` is the legacy Kwacha column,
 * kept because older rows only have that one (see priceFor).
 * `brand` is whatever the admin entered; blank falls back to CTW, as the
 * server does.
 */
export function normalizeProduct(raw) {
  return {
    id: raw.id,
    name: String(raw.name ?? ''),
    brand: String(raw.brand ?? '').trim() || DEFAULT_BRAND,
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
