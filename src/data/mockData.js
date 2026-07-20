/**
 * Mock data for the Aureus prototype. Values are illustrative only.
 */

export const RARITIES = {
  common: { label: 'Common', color: '#8B8B93' },
  uncommon: { label: 'Uncommon', color: '#5FA987' },
  rare: { label: 'Rare', color: '#4F86C6' },
  epic: { label: 'Epic', color: '#9B72CF' },
  legendary: { label: 'Legendary', color: '#D4AF37' },
};

export const coins = [
  {
    id: '1',
    name: 'Saint-Gaudens Double Eagle',
    country: 'USA',
    year: 1907,
    value: 3200,
    valueLow: 2800,
    valueHigh: 3600,
    rarity: 'legendary',
    metal: 'Gold',
    tint: '#3A2E12',
  },
  {
    id: '2',
    name: 'Sovereign',
    country: 'United Kingdom',
    year: 1899,
    value: 640,
    valueLow: 560,
    valueHigh: 720,
    rarity: 'rare',
    metal: 'Gold',
    tint: '#1B2A3A',
  },
  {
    id: '3',
    name: 'Maple Leaf',
    country: 'Canada',
    year: 1988,
    value: 410,
    valueLow: 360,
    valueHigh: 460,
    rarity: 'uncommon',
    metal: 'Silver',
    tint: '#3A1B1B',
  },
  {
    id: '4',
    name: 'Kangaroo Nugget',
    country: 'Australia',
    year: 1990,
    value: 285,
    valueLow: 240,
    valueHigh: 330,
    rarity: 'uncommon',
    metal: 'Gold',
    tint: '#1B3A2A',
  },
  {
    id: '5',
    name: 'Napoléon 20 Francs',
    country: 'France',
    year: 1811,
    value: 1150,
    valueLow: 980,
    valueHigh: 1320,
    rarity: 'epic',
    metal: 'Gold',
    tint: '#2A1B3A',
  },
  {
    id: '6',
    name: 'Morgan Dollar',
    country: 'USA',
    year: 1921,
    value: 95,
    valueLow: 70,
    valueHigh: 120,
    rarity: 'common',
    metal: 'Silver',
    tint: '#2E2E12',
  },
  {
    id: '7',
    name: 'Britannia',
    country: 'United Kingdom',
    year: 2015,
    value: 520,
    valueLow: 470,
    valueHigh: 570,
    rarity: 'rare',
    metal: 'Gold',
    tint: '#12222E',
  },
  {
    id: '8',
    name: 'Goldmark 20',
    country: 'Germany',
    year: 1873,
    value: 780,
    valueLow: 690,
    valueHigh: 880,
    rarity: 'epic',
    metal: 'Gold',
    tint: '#3A2A12',
  },
];

/** A single freshly-scanned coin used to populate the Scan results card. */
export const scannedCoin = {
  name: 'Saint-Gaudens Double Eagle',
  country: 'USA',
  year: 1907,
  valueLow: 2800,
  valueHigh: 3600,
  rarity: 'legendary',
  metal: 'Gold',
  confidence: 0.97,
};

export const formatCurrency = (n) =>
  '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

/** Total value across the collection. */
export const totalValue = coins.reduce((sum, c) => sum + c.value, 0);

/** Value grouped by country, sorted descending — for the donut chart. */
export const valueByCountry = Object.values(
  coins.reduce((acc, c) => {
    if (!acc[c.country]) acc[c.country] = { country: c.country, value: 0, count: 0 };
    acc[c.country].value += c.value;
    acc[c.country].count += 1;
    return acc;
  }, {})
).sort((a, b) => b.value - a.value);

/** Top 5 most valuable coins. */
export const topCoins = [...coins].sort((a, b) => b.value - a.value).slice(0, 5);
