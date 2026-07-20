# Aureus

A premium coin-collector iOS app UI, built with **React Native + Expo**. Think
finance app, but for coins — a dark collector's vault with warm gold accents.

## Screens

The app uses bottom-tab navigation across three screens:

| Tab | What's on it |
| --- | --- |
| **Scan** | Full-screen camera placeholder with a circular viewfinder and a gold capture button. Tapping capture reveals a results card: coin name, country, year, estimated value range, and a rarity badge. |
| **Collection** | A two-column grid of mock coins, each with a circular coin photo placeholder, name, country/year, and value. Header shows total vault value. |
| **Dashboard** | Total collection value shown prominently, a donut chart breaking value down by country (with legend), and a Top 5 most valuable coins list. |

## Design system

All tokens live in [`src/theme.js`](src/theme.js):

- **Background** — near-black (`#0B0B0F`) with layered charcoal surfaces
- **Accent** — a single warm gold family (`#D4AF37`)
- **Type** — restrained weights, generous letter-spacing on labels
- Rarity tiers (Common → Legendary) each carry their own color

## Project structure

```
App.js                      # Bottom-tab navigator + nav theme
index.js                    # Expo entry point
src/
  theme.js                  # Colors, spacing, radius, typography, shadows
  data/mockData.js          # Mock coins + derived dashboard data
  components/
    CoinAvatar.js           # SVG circular coin placeholder (milled edge)
    RarityBadge.js          # Rarity pill
    DonutChart.js           # SVG donut (no chart library)
  screens/
    ScanScreen.js
    CollectionScreen.js
    DashboardScreen.js
```

Charts and coin art are drawn with `react-native-svg` — no chart dependency.

## Running

```bash
npm install
npm start        # then press i (iOS), a (Android), or w (web)
```

> **Note:** App icon and splash images are intentionally omitted. Drop your
> assets into an `assets/` folder and re-add the `icon` / `splash` / `favicon`
> keys in [`app.json`](app.json) when ready.
