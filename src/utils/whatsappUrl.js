// Pure URL helpers, kept apart from whatsapp.js (which imports
// react-native) so they can be unit-tested under plain Jest.

const digitsOnly = (value) => String(value ?? '').replace(/\D/g, '');

/** True when a usable number is configured (international format, digits). */
export function isValidWhatsAppNumber(number) {
  const digits = digitsOnly(number);
  return digits.length >= 8 && digits.length <= 15;
}

/** Both URL forms for a number + message. */
export function buildWhatsAppUrls(number, text) {
  const phone = digitsOnly(number);
  const query = encodeURIComponent(text);
  return {
    app: `whatsapp://send?phone=${phone}&text=${query}`,
    web: `https://wa.me/${phone}?text=${query}`,
  };
}
