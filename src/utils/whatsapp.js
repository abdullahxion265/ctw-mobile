import { Linking } from 'react-native';
import { buildWhatsAppUrls } from './whatsappUrl';

export { isValidWhatsAppNumber } from './whatsappUrl';

/**
 * Opens WhatsApp directly when it is installed (the whatsapp:// scheme),
 * and falls back to the wa.me web link when that scheme has no handler.
 * Trying openURL and catching beats canOpenURL here: canOpenURL needs
 * the scheme pre-declared in the Android manifest / iOS Info.plist,
 * which a managed Expo build does not do for you.
 *
 * Resolves true if either link opened, false if neither did.
 */
export async function openWhatsApp(number, text) {
  const { app, web } = buildWhatsAppUrls(number, text);
  try {
    await Linking.openURL(app);
    return true;
  } catch {
    try {
      await Linking.openURL(web);
      return true;
    } catch {
      return false;
    }
  }
}
