// Price parsing and formatting. Pure functions, no React Native imports,
// so they are unit-tested under plain Jest.

export const CURRENCIES = {
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', field: 'price_zar' },
  MWK: { code: 'MWK', symbol: 'MK', name: 'Malawian Kwacha', field: 'price_mwk' },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES);

export const PRICE_ON_REQUEST = 'Price on request';

export function isCurrencyCode(value) {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(CURRENCIES, value);
}

/**
 * The API returns prices as strings with two decimals ("1300.00") and
 * null where a price was never set (older products have no Rand price).
 * Returns a finite number, or null when there is no usable price.
 */
export function parsePrice(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : parseFloat(String(value).trim());
  return Number.isFinite(n) ? n : null;
}

/** Price of a product in a currency, or null if the admin never set one. */
export function priceFor(item, currency) {
  const field = (CURRENCIES[currency] || CURRENCIES.ZAR).field;
  return parsePrice(item?.[field]);
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
