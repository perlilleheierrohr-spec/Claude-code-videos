/**
 * Aureus design system.
 *
 * The vibe: a premium collector's vault. Near-black backgrounds with layered
 * charcoal surfaces, warm gold as the single accent, and restrained type.
 */

export const colors = {
  // Backgrounds — deepest to nearest surface.
  background: '#0B0B0F',
  surface: '#15151C',
  surfaceElevated: '#1D1D26',
  surfaceHigh: '#26262F',

  // Gold accent family.
  gold: '#D4AF37',
  goldBright: '#F0CE6A',
  goldDeep: '#A8842B',
  goldSoft: 'rgba(212, 175, 55, 0.12)',
  goldBorder: 'rgba(212, 175, 55, 0.35)',

  // Text.
  textPrimary: '#F5F3EC',
  textSecondary: '#A5A2B0',
  textMuted: '#6C6A78',

  // Hairlines & dividers.
  border: 'rgba(255, 255, 255, 0.07)',
  borderStrong: 'rgba(255, 255, 255, 0.12)',

  // Rarity scale.
  rarityCommon: '#8B8B93',
  rarityUncommon: '#5FA987',
  rarityRare: '#4F86C6',
  rarityEpic: '#9B72CF',
  rarityLegendary: '#D4AF37',

  // Utility.
  positive: '#5FA987',
  overlay: 'rgba(0, 0, 0, 0.55)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};

export const typography = {
  hero: { fontSize: 44, fontWeight: '700', letterSpacing: 0.5 },
  title: { fontSize: 26, fontWeight: '700', letterSpacing: 0.3 },
  heading: { fontSize: 20, fontWeight: '700', letterSpacing: 0.2 },
  body: { fontSize: 15, fontWeight: '500' },
  label: { fontSize: 13, fontWeight: '600', letterSpacing: 0.4 },
  caption: { fontSize: 11, fontWeight: '600', letterSpacing: 1.2 },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  gold: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
};

/** Preferred accent colors for common countries on the dashboard donut. */
export const countryColors = {
  USA: '#D4AF37',
  'United States': '#D4AF37',
  'United Kingdom': '#4F86C6',
  Canada: '#C6564F',
  Australia: '#5FA987',
  France: '#9B72CF',
  Germany: '#E08A3C',
  Other: '#6C6A78',
};

/** Fallback palette for countries not in `countryColors`. */
export const chartPalette = [
  '#D4AF37',
  '#4F86C6',
  '#C6564F',
  '#5FA987',
  '#9B72CF',
  '#E08A3C',
  '#4FB0C6',
  '#C68F4F',
  '#8B6CCF',
  '#C64F97',
];

/** Deterministic color for a country: preferred if known, else palette by hash. */
export function colorForCountry(country, index = 0) {
  if (countryColors[country]) return countryColors[country];
  return chartPalette[index % chartPalette.length];
}
