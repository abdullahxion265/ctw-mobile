import {
  MAX_QTY,
  MAX_LINES,
  MAX_NOTES_LENGTH,
  addToCart,
  setQuantity,
  removeFromCart,
  mergeFreshProducts,
  computeTotals,
  countUnits,
  lineTotal,
  buildOrderMessage,
  buildProductMessage,
  hydrateCart,
  clampQuantity,
  sanitizeNotes,
  removedNotice,
} from '../cart';
import { normalizeProduct } from '../product';

const tee = { id: 1, name: 'Classic Slim Tee', brand: 'CTW', category: 'men', image_url: '/uploads/a.jpg', price: 50000, price_mwk: 50000, price_zar: 500 };
const chino = { id: 2, name: 'Heritage Chino', brand: 'Levi', category: 'men', image_url: null, price: 120000, price_mwk: 120000, price_zar: 1200 };
const oldCap = { id: 3, name: 'Old Cap', brand: 'CTW', category: 'caps', image_url: null, price: 8000, price_mwk: 8000, price_zar: null };

describe('quantity and limits', () => {
  test('clampQuantity keeps 1..20', () => {
    expect(clampQuantity(0)).toBe(1);
    expect(clampQuantity(-4)).toBe(1);
    expect(clampQuantity('7')).toBe(7);
    expect(clampQuantity(99)).toBe(MAX_QTY);
    expect(clampQuantity('x')).toBe(1);
    expect(clampQuantity(2.9)).toBe(2);
  });

  test('adding the same product increases quantity, capped at 20', () => {
    let { items } = addToCart([], tee, 1);
    expect(items).toHaveLength(1);
    const again = addToCart(items, tee, 1);
    expect(again.status).toBe('increased');
    expect(again.items[0].quantity).toBe(2);

    items = setQuantity(again.items, 1, MAX_QTY);
    const capped = addToCart(items, tee, 1);
    expect(capped.status).toBe('max_qty');
    expect(capped.items).toBe(items);
  });

  test('at most 25 distinct lines', () => {
    let items = [];
    for (let id = 1; id <= MAX_LINES; id += 1) {
      items = addToCart(items, { ...tee, id }, 1).items;
    }
    expect(items).toHaveLength(MAX_LINES);
    const full = addToCart(items, { ...tee, id: 999 }, 1);
    expect(full.status).toBe('cart_full');
    expect(full.items).toBe(items);
    // existing lines can still be bumped when the cart is full
    expect(addToCart(items, { ...tee, id: 1 }, 1).status).toBe('increased');
  });

  test('setQuantity clamps and removeFromCart removes', () => {
    const items = addToCart([], tee).items;
    expect(setQuantity(items, 1, 500)[0].quantity).toBe(MAX_QTY);
    expect(setQuantity(items, 1, 5)[0].quantity).toBe(5);
    // like the web's setQty, going below 1 removes the line
    expect(setQuantity(items, 1, 0)).toEqual([]);
    expect(removeFromCart(items, 1)).toEqual([]);
  });

  test('notes are limited to 300 characters', () => {
    expect(sanitizeNotes('a'.repeat(500))).toHaveLength(MAX_NOTES_LENGTH);
    expect(sanitizeNotes(null)).toBe('');
  });

  test('a stored line keeps only the snapshot fields', () => {
    const line = addToCart([], { ...tee, description: 'x', created_at: 'y', brand: 'Nike' }).items[0];
    expect(Object.keys(line).sort()).toEqual(
      ['brand', 'category', 'id', 'image_url', 'name', 'price', 'price_mwk', 'price_zar', 'quantity']
    );
  });
});

describe('totals', () => {
  test('totals per currency', () => {
    let items = addToCart([], tee, 2).items;
    items = addToCart(items, chino, 1).items;
    expect(computeTotals(items, 'ZAR').total).toBe(2200);
    expect(computeTotals(items, 'MWK').total).toBe(220000);
    expect(countUnits(items)).toBe(3);
  });

  test('lines with no price in the currency are excluded and counted', () => {
    let items = addToCart([], tee, 1).items;
    items = addToCart(items, oldCap, 3).items;
    const zar = computeTotals(items, 'ZAR');
    expect(zar.total).toBe(500);
    expect(zar.pricedLines).toBe(1);
    expect(zar.onRequestLines).toBe(1);
    expect(lineTotal(items[1], 'ZAR')).toBeNull();
    const mwk = computeTotals(items, 'MWK');
    expect(mwk.onRequestLines).toBe(0);
    expect(mwk.total).toBe(50000 + 8000 * 3);
  });

  test('sums in cents, no floating point drift', () => {
    const a = { ...tee, id: 10, price_zar: 0.1 };
    const b = { ...tee, id: 11, price_zar: 0.2 };
    const items = addToCart(addToCart([], a).items, b).items;
    expect(computeTotals(items, 'ZAR').total).toBe(0.3);
  });
});

describe('refresh against the API', () => {
  test('updates names and prices, keeps quantities', () => {
    const items = addToCart([], tee, 4).items;
    const fresh = [{ ...tee, name: 'Classic Slim Tee v2', price_zar: 550 }];
    const { items: next, removed } = mergeFreshProducts(items, fresh);
    expect(removed).toEqual([]);
    expect(next[0].name).toBe('Classic Slim Tee v2');
    expect(next[0].price_zar).toBe(550);
    expect(next[0].quantity).toBe(4);
  });

  test('drops products that no longer exist and reports them', () => {
    let items = addToCart([], tee, 1).items;
    items = addToCart(items, chino, 2).items;
    const { items: next, removed } = mergeFreshProducts(items, [chino]);
    expect(next.map((i) => i.id)).toEqual([2]);
    expect(next[0].quantity).toBe(2);
    expect(removed).toEqual(['Classic Slim Tee']);
    expect(removedNotice(removed)).toBe('Classic Slim Tee is no longer available and was removed.');
    expect(removedNotice(['A', 'B'])).toBe('A, B is no longer available and was removed.');
  });

  test('matches ids across number and string forms', () => {
    const items = addToCart([], tee, 1).items;
    const { items: next, removed } = mergeFreshProducts(items, [{ ...tee, id: '1' }]);
    expect(removed).toEqual([]);
    expect(next).toHaveLength(1);
  });

  test('works with normalised API products (string prices)', () => {
    const api = normalizeProduct({ id: 9, name: 'Hoodie', brand: ' Nike ', category: 'hoodies', price: '123500.00', price_mwk: '123500.00', price_zar: '1300.00', image_url: null });
    const items = addToCart([], api).items;
    expect(items[0].price_zar).toBe(1300);
    expect(computeTotals(items, 'ZAR').total).toBe(1300);
  });
});

describe('WhatsApp messages (identical to the web shop)', () => {
  test('cart message', () => {
    let items = addToCart([], tee, 2).items;
    items = addToCart(items, chino, 1).items;
    const msg = buildOrderMessage({ items, currency: 'ZAR', notes: 'Hoodie L black, shoes size 9' });
    expect(msg).toBe(
      [
        "Hi CarterTheTownWear! I'd like to order:",
        '',
        '1. *Classic Slim Tee* (CTW)',
        '   2 x R500.00 = R1,000.00',
        '2. *Heritage Chino* (Levi)',
        '   1 x R1,200.00 = R1,200.00',
        '',
        'Total (ZAR): R2,200.00',
        '',
        'Notes: Hoodie L black, shoes size 9',
        '',
        'Please confirm availability and how to pay.',
      ].join('\n')
    );
  });

  test('no notes line when notes are empty or whitespace', () => {
    const items = addToCart([], tee, 1).items;
    const msg = buildOrderMessage({ items, currency: 'ZAR', notes: '   ' });
    expect(msg).not.toContain('Notes:');
    expect(msg.endsWith('Total (ZAR): R500.00\n\nPlease confirm availability and how to pay.')).toBe(true);
  });

  test('notes are trimmed and capped at 300 characters', () => {
    const items = addToCart([], tee, 1).items;
    const msg = buildOrderMessage({ items, currency: 'ZAR', notes: `  ${'n'.repeat(400)}  ` });
    expect(msg).toContain(`Notes: ${'n'.repeat(300)}\n`);
    expect(msg).not.toContain('n'.repeat(301));
  });

  test('Kwacha message uses MK and a MWK total', () => {
    const items = addToCart([], chino, 1).items;
    const msg = buildOrderMessage({ items, currency: 'MWK', notes: '' });
    expect(msg).toContain('1 x MK120,000.00 = MK120,000.00');
    expect(msg).toContain('Total (MWK): MK120,000.00');
  });

  test('on-request lines say so and the total gets "+ items on request"', () => {
    let items = addToCart([], tee, 1).items;
    items = addToCart(items, oldCap, 2).items;
    const msg = buildOrderMessage({ items, currency: 'ZAR', notes: '' });
    expect(msg).toContain('2. *Old Cap* (CTW)');
    expect(msg).toContain('2 x Price on request');
    expect(msg).toContain('Total (ZAR): R500.00 + items on request');
  });

  test('a cart of only on-request lines still has a total line, as on the web', () => {
    const items = addToCart([], oldCap, 1).items;
    expect(buildOrderMessage({ items, currency: 'ZAR', notes: '' })).toContain('Total (ZAR): R0.00 + items on request');
  });

  test('a line without a brand has no brackets', () => {
    const items = addToCart([], { ...tee, brand: null }, 1).items;
    expect(buildOrderMessage({ items, currency: 'ZAR', notes: '' })).toContain('1. *Classic Slim Tee*\n');
  });

  test('single product message', () => {
    expect(buildProductMessage(chino, 'ZAR')).toBe(
      [
        "Hi CarterTheTownWear! I'm interested in purchasing:",
        '',
        '*Heritage Chino* by Levi',
        'Category: Men',
        'Price: R1,200.00',
        '',
        'Please let me know availability and how to proceed.',
      ].join('\n')
    );
    expect(buildProductMessage(oldCap, 'ZAR')).toContain('Price: Price on request');
  });
});

describe('hydrateCart', () => {
  test('survives garbage', () => {
    expect(hydrateCart(null)).toEqual({ items: [], notes: '' });
    expect(hydrateCart('nope')).toEqual({ items: [], notes: '' });
    expect(hydrateCart({ items: 'x' })).toEqual({ items: [], notes: '' });
  });

  test('drops malformed lines and duplicates, re-clamps, trims notes', () => {
    const out = hydrateCart({
      items: [
        { ...tee, quantity: 999 },
        { ...tee, quantity: 2 },
        { id: 5 },
        null,
        { ...chino, quantity: 'abc' },
      ],
      notes: 'n'.repeat(400),
    });
    expect(out.items.map((i) => i.id)).toEqual([1, 2]);
    expect(out.items[0].quantity).toBe(MAX_QTY);
    expect(out.items[1].quantity).toBe(1);
    expect(out.notes).toHaveLength(MAX_NOTES_LENGTH);
  });

  test('caps at 25 lines', () => {
    const many = Array.from({ length: 40 }, (_, i) => ({ ...tee, id: i + 1, quantity: 1 }));
    expect(hydrateCart({ items: many }).items).toHaveLength(MAX_LINES);
  });
});

describe('normalizeProduct brand', () => {
  test('keeps the admin brand, trimmed; blank falls back to CTW', () => {
    expect(normalizeProduct({ id: 1, name: 'x', brand: ' Nike ', category: 'MEN' }).brand).toBe('Nike');
    expect(normalizeProduct({ id: 1, name: 'x', brand: '', category: 'men' }).brand).toBe('CTW');
    expect(normalizeProduct({ id: 1, name: 'x', category: 'men' }).brand).toBe('CTW');
    expect(normalizeProduct({ id: 1, name: 'x', brand: 'A', category: 'MEN' }).category).toBe('men');
  });

  test('the brand is stored on the cart line', () => {
    const line = addToCart([], normalizeProduct({ id: 7, name: 'Cap', brand: 'Nike', category: 'caps', price_zar: '100.00' })).items[0];
    expect(line.brand).toBe('Nike');
  });
});
