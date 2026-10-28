import { buildWhatsAppUrls, isValidWhatsAppNumber } from '../whatsappUrl';

describe('whatsapp urls', () => {
  test('strips formatting from the number and encodes the message', () => {
    const { app, web } = buildWhatsAppUrls('+27 82 123 4567', 'Hi CTW!\n1. *Tee*');
    expect(app).toBe('whatsapp://send?phone=27821234567&text=Hi%20CTW!%0A1.%20*Tee*');
    expect(web).toBe('https://wa.me/27821234567?text=Hi%20CTW!%0A1.%20*Tee*');
  });

  test('validates configured numbers', () => {
    expect(isValidWhatsAppNumber('27821234567')).toBe(true);
    expect(isValidWhatsAppNumber('')).toBe(false);
    expect(isValidWhatsAppNumber(undefined)).toBe(false);
    expect(isValidWhatsAppNumber('123')).toBe(false);
  });
});
