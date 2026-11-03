// Price parsing and formatting. Pure functions, no React Native imports,
// so they are unit-tested under plain Jest. Rules mirror the web shop's
// client/src/utils/currency.js.

export const CURRENCIES = {
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', shortName: 'Rand', field: 'price_zar' },
  MWK: { code: 'MWK', symbol: 'MK', name: 'Malawian Kwacha', shortName: 'Kwacha', field: 'price_mwk' },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES);

export const PRICE_ON_REQUEST = 'Price on request';

export function isCurrencyCode(value) {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(CURRENCIES, value);
}

/**
 * The API returns prices as strings with two decimals ("1300.00") and
 * null where a price was never set. Returns a finite number, or null.
 */
export function parsePrice(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : parseFloat(String(value).trim());
  return Number.isFinite(n) ? n : null;
}

/**
 * Price of a product in a currency, or null when there is none.
 * Same as the web's getPrice:
 *  - a price must be greater than 0 (0.00 counts as "not set")
 *  - rows from before the dual-currency migration only have the legacy
 *    Kwacha `price`, so MWK falls back to it when price_mwk is empty
 *  - there is no such fallback for Rand
 */
export function priceFor(item, currency) {
  const { field } = CURRENCIES[currency] || CURRENCIES.ZAR;
  let raw = item?.[field];
  if ((raw === null || raw === undefined) && currency === 'MWK') raw = item?.price;
  const n = parsePrice(raw);
  return n !== null && n > 0 ? n : null;
}

/**
 * Symbol, thousands separators, always two decimals:
 * R1,299.50 and MK125,000.00. Hand-rolled instead of Intl so Hermes
 * and every Android locale produce identical output.
 */
export function formatMoney(amount, currency) {
  const { symbol } = CURRENCIES[currency] || CURRENCIES.ZAR;
  const negative = amount < 0;
  const [whole, decimals] = Math.abs(amount).toFixed(2).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${negative ? '-' : ''}${symbol}${grouped}.${decimals}`;
}

/** Display string for a product/line price: formatted, or "Price on request". */
export function formatItemPrice(item, currency) {
  const price = priceFor(item, currency);
  return price === null ? PRICE_ON_REQUEST : formatMoney(price, currency);
}
