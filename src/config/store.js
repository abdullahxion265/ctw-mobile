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

export const MAX_PHOTOS = 4;

// Same accounts and wording as the web shop (client/src/config.js). Change a link here and rebuild.
// The Facebook link is a post link on the web too; swap in the page link when the client has it.
export const SOCIAL_LINKS = [
  { id: 'instagram', label: 'Instagram', sub: 'Follow on Instagram', url: 'https://www.instagram.com/carter_the_town_wear_/' },
  { id: 'tiktok',    label: 'TikTok',    sub: 'Follow on TikTok',    url: 'https://vt.tiktok.com/ZSgK4jeyJ/' },
  { id: 'facebook',  label: 'Facebook',  sub: 'Follow on Facebook',     url: 'https://www.facebook.com/100087507815896/posts/1076516918608559/' },
  { id: 'threads',   label: 'Threads',   sub: 'Follow on Threads',   url: 'https://www.threads.com/@carter_the_town_wear_' },
];

// Shown next to ordering (product screen, cart, More). No fees or areas are promised.
export const DELIVERY = {
  title: 'Delivery available',
  note: 'Tell us your area when you order and we will arrange delivery.',
};

// Public contact address. Shown as plain text, not a link, same as the web (config.js: CONTACT_EMAIL).
export const CONTACT_EMAIL = 'info@carterthetownwear.com';
