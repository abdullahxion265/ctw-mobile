/**
 * Design tokens for CarterTheTownWear. Same shape as the Zakumunda
 * theme (colors / spacing / radius / typography / shadow) so screens
 * import it the same way, but the values are the client's store
 * palette from the handoff: near-black surfaces, gold accent.
 *
 * Unlike Zakumunda (system font on purpose), this brand is
 * typographic: Playfair Display carries headings and prices, DM Sans
 * the body, DM Mono the small uppercase labels. Fonts are loaded in
 * App.js, which holds the splash until they are ready, so there is no
 * flash of unstyled text. Rule: never combine these family names with
 * fontWeight — each weight is its own font file, and Android resolves
 * a fontFamily + fontWeight pair to the wrong (or a fallback) file.
 */
export const colors = {
  bg: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceRaised: '#242424',

  gold: '#D4AF37',
  goldLight: '#E6C75A',
  goldMuted: '#AA7C11',
  onGold: '#0D0D0D',

  textPrimary: '#F5F5F7',
  textSecondary: '#C7C7CC',
  textMuted: '#8E8E93',

  // thin gold-tinted hairlines used on cards and bars
  border: 'rgba(212,175,55,0.22)',
  borderSubtle: 'rgba(255,255,255,0.08)',

  danger: '#E5675B',
  dangerBg: 'rgba(229,103,91,0.14)',
  success: '#6FCF97',
  successBg: 'rgba(111,207,151,0.12)',
  notice: 'rgba(212,175,55,0.12)',

  backdrop: 'rgba(0,0,0,0.65)',
};

export const fonts = {
  heading: 'PlayfairDisplay_700Bold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
  mono: 'DMMono_500Medium',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

// Small uppercase labels (the "CTW" tag above products, section
// eyebrows). Spread into a style: { ...typography.label, color: ... }
export const typography = {
  label: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1.6, textTransform: 'uppercase' },
  h1: { fontFamily: fonts.heading, fontSize: 32, lineHeight: 40 },
  h2: { fontFamily: fonts.heading, fontSize: 24, lineHeight: 31 },
  h3: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fonts.body, fontSize: 14.5, lineHeight: 22 },
  bodyBold: { fontFamily: fonts.bodyBold, fontSize: 14.5 },
  small: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18 },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 3,
  },
  raised: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
  gold: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 4,
  },
};

export default { colors, fonts, spacing, radius, typography, shadow };
