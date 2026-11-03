// Store-level rules shared across screens. Mirrors the web app's
// client/src/config.js: categories, default currency, display labels.
// Kids was removed from the shop and is deliberately absent.

export const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'hoodies', label: 'Hoodies' },
  { value: 'caps', label: 'Caps' },
  { value: 'shoes', label: 'Shoes' },
];

// Display names for API category slugs. Unknown slugs (e.g. a leftover
// "kids" row) fall back to a capitalised version of the slug.
export const CATEGORY_LABELS = {
  men: 'Men',
  women: 'Women',
  hoodies: 'Hoodies',
  caps: 'Caps',
  shoes: 'Shoes',
};

export const DEFAULT_CURRENCY = 'ZAR';

// The shop's own label. The admin can enter any brand per product; a blank
// brand is stored as CTW by the server, and the app falls back to it too.
export const DEFAULT_BRAND = 'CTW';

export const PAGE_SIZE = 12;
