import { photosOf } from '../photos';
import { normalizeProduct } from '../product';

describe('photosOf (web: utils/photos.js)', () => {
  test('uses the ordered images list, main photo first', () => {
    expect(photosOf({ images: ['/a.jpg', '/b.jpg'], image_url: '/a.jpg' })).toEqual(['/a.jpg', '/b.jpg']);
  });

  test('older responses with only image_url still give one photo', () => {
    expect(photosOf({ image_url: '/a.jpg' })).toEqual(['/a.jpg']);
    expect(photosOf({ images: [], image_url: '/a.jpg' })).toEqual(['/a.jpg']);
  });

  test('no photos at all', () => {
    expect(photosOf({ image_url: null })).toEqual([]);
    expect(photosOf({ images: [] })).toEqual([]);
    expect(photosOf(null)).toEqual([]);
  });

  test('ignores junk entries and caps at 4', () => {
    expect(photosOf({ images: ['/1', '', null, '/2', '/3', '/4', '/5', '/6'] })).toEqual(['/1', '/2', '/3', '/4']);
  });
});

describe('normalizeProduct photos', () => {
  test('keeps images and mirrors the first one into image_url', () => {
    const p = normalizeProduct({ id: 1, name: 'x', category: 'men', images: ['/a.jpg', '/b.jpg'], image_url: null });
    expect(p.images).toEqual(['/a.jpg', '/b.jpg']);
    expect(p.image_url).toBe('/a.jpg');
  });

  test('a product with no photos has empty images and a null image_url', () => {
    const p = normalizeProduct({ id: 2, name: 'y', category: 'men' });
    expect(p.images).toEqual([]);
    expect(p.image_url).toBeNull();
  });
});
