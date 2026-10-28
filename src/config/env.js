/**
 * Network + brand constants. Unlike the Zakumunda app there is no
 * local-IP dance here: CarterTheTownWear's API is already live over
 * HTTPS, and native apps are not subject to CORS, so the production
 * URL works from a phone, an emulator and Expo Go alike.
 */
export const SITE_ORIGIN = 'https://www.carterthetownwear.com';
export const API_BASE_URL = `${SITE_ORIGIN}/api`;

export const APP_NAME = 'Carter The Town Wear';
export const BRAND_LABEL = 'CTW';

/**
 * REQUIRED before release: the client's WhatsApp number in international
 * format, digits only, no "+" or spaces (South Africa example:
 * '27821234567'). The API does not expose it, so it is baked in here.
 *
 * Once the server gets GET /api/config (handoff doc, section 9), the app
 * picks the number up from there automatically and this value becomes
 * only the offline/first-launch fallback — see context/ConfigContext.js.
 */
export const WHATSAPP_NUMBER = '27671897241';
