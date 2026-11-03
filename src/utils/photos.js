import { MAX_PHOTOS } from '../config/store';

/**
 * Photos of a product, main photo first (web: client/src/utils/photos.js).
 * The API returns `images` (ordered, first = main) and still returns
 * `image_url` (the first photo) for older clients, so fall back to it.
 * Capped at 4, the most the admin can add.
 */
export function photosOf(product) {
  if (!product) return [];
  const list = Array.isArray(product.images) ? product.images.filter((u) => typeof u === 'string' && u) : [];
  if (list.length) return list.slice(0, MAX_PHOTOS);
  return product.image_url ? [product.image_url] : [];
}
