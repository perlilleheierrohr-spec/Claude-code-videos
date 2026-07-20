/**
 * Shared formatting helpers and the rarity scale.
 */

export const RARITIES = {
  common: { label: 'Common', color: '#8B8B93' },
  uncommon: { label: 'Uncommon', color: '#5FA987' },
  rare: { label: 'Rare', color: '#4F86C6' },
  epic: { label: 'Epic', color: '#9B72CF' },
  legendary: { label: 'Legendary', color: '#D4AF37' },
};

const SYMBOLS = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$' };

/** Format a number as a currency amount, e.g. 3200 -> "$3,200". */
export function formatCurrency(n, currency = 'USD') {
  const symbol = SYMBOLS[currency] || '$';
  const value = Number.isFinite(n) ? n : 0;
  return symbol + value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}
