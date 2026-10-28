import { SITE_ORIGIN } from '../config/env';

/**
 * The API returns image_url as a relative path ("/uploads/...") and it
 * can be null. A phone has no "current page" to resolve a relative path
 * against, so prefix the site origin. Absolute URLs pass through
 * unchanged; null/empty returns null so callers can show a placeholder.
 */
export function getImageUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}
