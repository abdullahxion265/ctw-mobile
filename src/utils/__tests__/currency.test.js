import { parsePrice, formatMoney, formatItemPrice, priceFor, PRICE_ON_REQUEST } from '../currency';

describe('parsePrice', () => {
  test('parses two-decimal strings', () => {
    expect(parsePrice('1300.00')).toBe(1300);
    expect(parsePrice('123500.00')).toBe(123500);
    expect(parsePrice(' 99.50 ')).toBe(99.5);
  });
  test('null, empty and garbage become null', () => {
    expect(parsePrice(null)).toBeNull();
    expect(parsePrice(undefined)).toBeNull();
    expect(parsePrice('')).toBeNull();
    expect(parsePrice('abc')).toBeNull();
    expect(parsePrice(NaN)).toBeNull();
  });
  test('numbers pass through', () => {
    expect(parsePrice(250)).toBe(250);
  });
});

describe('formatMoney', () => {
  test('symbol, thousands separators, two decimals', () => {
    expect(formatMoney(1299.5, 'ZAR')).toBe('R1,299.50');
    expect(formatMoney(125000, 'MWK')).toBe('MK125,000.00');
    expect(formatMoney(0, 'ZAR')).toBe('R0.00');
    expect(formatMoney(999.999, 'ZAR')).toBe('R1,000.00');
    expect(formatMoney(1234567.891, 'MWK')).toBe('MK1,234,567.89');
  });
  test('unknown currency falls back to Rand', () => {
    expect(formatMoney(10, 'USD')).toBe('R10.00');
  });
});

describe('priceFor / formatItemPrice', () => {
  const item = { price: 123500, price_mwk: 123500, price_zar: 1300 };
  test('reads the right field per currency, never the legacy price', () => {
    expect(priceFor(item, 'ZAR')).toBe(1300);
    expect(priceFor(item, 'MWK')).toBe(123500);
  });
  test('missing Rand price is price on request', () => {
    const old = { price: 5000, price_mwk: 5000, price_zar: null };
    expect(priceFor(old, 'ZAR')).toBeNull();
    expect(formatItemPrice(old, 'ZAR')).toBe(PRICE_ON_REQUEST);
    expect(formatItemPrice(old, 'MWK')).toBe('MK5,000.00');
  });
});
