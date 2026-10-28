// Cart rules, ported from the web app's client/src/utils/cart.js as pure
// functions (no React, no storage, no network) so they are unit-tested
// and behave identically to the web cart. CartContext wires them to
// AsyncStorage and the API.

import { formatMoney, priceFor, parsePrice, isCurrencyCode, PRICE_ON_REQUEST } from './currency';
import { categoryLabel } from './product';

export const MIN_QTY = 1;
export const MAX_QTY = 20; // per line
export const MAX_LINES = 25; // distinct products
export const MAX_NOTES_LENGTH = 300;

const sameId = (a, b) => String(a) === String(b);

export function clampQuantity(value) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < MIN_QTY) return MIN_QTY;
  return Math.min(n, MAX_QTY);
}

export function sanitizeNotes(value) {
  return String(value ?? '').slice(0, MAX_NOTES_LENGTH);
}

/**
 * The snapshot stored per line: id, name, category, image path, the
 * three prices and the quantity. Refreshed from the API later; the
 * cart never trusts it as the source of truth.
 */
function toLine(product, quantity) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    image_url: product.image_url || null,
    price: parsePrice(product.price),
    price_mwk: parsePrice(product.price_mwk),
    price_zar: parsePrice(product.price_zar),
    quantity: clampQuantity(quantity),
  };
}

/**
 * Adds a product, or bumps the quantity if it is already there.
 * status: 'added' | 'increased' | 'max_qty' | 'cart_full'.
 * On max_qty / cart_full the items come back unchanged.
 */
export function addToCart(items, product, quantity = 1) {
  const index = items.findIndex((i) => sameId(i.id, product.id));
  if (index >= 0) {
    if (items[index].quantity >= MAX_QTY) return { items, status: 'max_qty' };
    const next = items.slice();
    next[index] = { ...items[index], quantity: clampQuantity(items[index].quantity + quantity) };
    return { items: next, status: 'increased' };
  }
  if (items.length >= MAX_LINES) return { items, status: 'cart_full' };
  return { items: [...items, toLine(product, quantity)], status: 'added' };
}

export function setQuantity(items, id, quantity) {
  return items.map((i) => (sameId(i.id, id) ? { ...i, quantity: clampQuantity(quantity) } : i));
}

export function removeFromCart(items, id) {
  return items.filter((i) => !sameId(i.id, id));
}

/**
 * Refresh behaviour: update names and prices from fresh API data, keep
 * quantities, drop products that no longer exist. Returns the names of
 * the dropped lines so the UI can say "X is no longer available and
 * was removed." The caller must only invoke this with a valid response;
 * network errors are ignored upstream and the cart is left as is.
 */
export function mergeFreshProducts(items, freshProducts) {
  const byId = new Map(freshProducts.map((p) => [String(p.id), p]));
  const removed = [];
  const next = [];
  for (const item of items) {
    const fresh = byId.get(String(item.id));
    if (!fresh) {
      removed.push(item.name);
      continue;
    }
    next.push({ ...toLine(fresh, item.quantity), id: item.id });
  }
  return { items: next, removed };
}

export const removedNotice = (name) => `${name} is no longer available and was removed.`;

/** Total quantity across lines — what the tab badge shows. */
export function countUnits(items) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

// Money is summed in whole cents so 0.1 + 0.2 style drift never reaches
// the customer or the WhatsApp message.
const toCents = (amount) => Math.round(amount * 100);

export function lineTotal(item, currency) {
  const unit = priceFor(item, currency);
  return unit === null ? null : (toCents(unit) * item.quantity) / 100;
}

/**
 * Totals per currency. Lines with no price in that currency are
 * "priced on request": excluded from the total and counted so the UI
 * can say how many.
 */
export function computeTotals(items, currency) {
  let cents = 0;
  let pricedLines = 0;
  let onRequestLines = 0;
  for (const item of items) {
    const unit = priceFor(item, currency);
    if (unit === null) {
      onRequestLines += 1;
    } else {
      pricedLines += 1;
      cents += toCents(unit) * item.quantity;
    }
  }
  return { total: cents / 100, pricedLines, onRequestLines, units: countUnits(items) };
}

/**
 * The cart message sent to the shop's WhatsApp number. Format is fixed
 * by the web shop: numbered lines, bold names, "qty x unit = line",
 * a currency-labelled total, optional notes, a closing request.
 */
export function buildOrderMessage({ items, currency, notes }) {
  const code = isCurrencyCode(currency) ? currency : 'ZAR';
  const lines = items.map((item, index) => {
    const unit = priceFor(item, code);
    const pricing =
      unit === null
        ? `${item.quantity} x ${PRICE_ON_REQUEST}`
        : `${item.quantity} x ${formatMoney(unit, code)} = ${formatMoney(lineTotal(item, code), code)}`;
    return `${index + 1}. *${item.name}*\n   ${pricing}`;
  });

  const { total, pricedLines, onRequestLines } = computeTotals(items, code);
  const parts = ["Hi CTW! I'd like to order:", '', lines.join('\n')];

  if (pricedLines > 0) {
    parts.push('', `Total (${code}): ${formatMoney(total, code)}`);
  }
  if (onRequestLines > 0) {
    const note = `${onRequestLines} item${onRequestLines === 1 ? '' : 's'} priced on request, not included in the total.`;
    // Sits directly under the total when there is one, otherwise stands alone.
    parts.push(...(pricedLines > 0 ? [note] : ['', note]));
  }

  const cleanNotes = sanitizeNotes(notes).trim();
  if (cleanNotes) parts.push('', `Notes: ${cleanNotes}`);

  parts.push('', 'Please confirm availability and how to pay.');
  return parts.join('\n');
}

/** The shorter message from a single product's "Order via WhatsApp" button. */
export function buildProductMessage(product, currency) {
  const code = isCurrencyCode(currency) ? currency : 'ZAR';
  const price = priceFor(product, code);
  return [
    "Hi CTW! I'm interested in:",
    '',
    `*${product.name}* (${categoryLabel(product.category)})`,
    `Price (${code}): ${price === null ? PRICE_ON_REQUEST.toLowerCase() : formatMoney(price, code)}`,
    '',
    'Please confirm availability.',
  ].join('\n');
}

/**
 * Rebuilds a cart from whatever AsyncStorage returned. Anything
 * malformed is dropped rather than crashing the app on launch, limits
 * are re-applied, and quantities are re-clamped.
 */
export function hydrateCart(raw) {
  const empty = { items: [], notes: '' };
  if (!raw || typeof raw !== 'object') return empty;
  const stored = Array.isArray(raw.items) ? raw.items : [];
  const seen = new Set();
  const items = [];
  for (const entry of stored) {
    if (!entry || entry.id === undefined || entry.id === null || typeof entry.name !== 'string') continue;
    const key = String(entry.id);
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(toLine(entry, entry.quantity));
    if (items.length >= MAX_LINES) break;
  }
  return { items, notes: sanitizeNotes(raw.notes) };
}

