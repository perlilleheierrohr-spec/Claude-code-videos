# Aureus

A coin-collector iOS app built with **React Native + Expo**: point your camera
at a coin, and AI identifies it and estimates its value. Styled as a premium
dark/gold collector's vault.

This is a **fully functional app**, not a mockup — real authentication, real
camera + AI scanning, and a real cloud-synced collection.

## What it does

| Tab | What's on it |
| --- | --- |
| **Scan** | Real camera with a circular viewfinder. Tap the gold button → the photo is sent to Claude vision, which returns the coin's name, country, year, metal, an estimated value range, a rarity tier, and a short rationale. Add it to your collection with one tap. |
| **Collection** | Your real coins, synced to the cloud — circular photo, name, country/year, and value. Long-press to remove. |
| **Dashboard** | Total collection value, a donut breakdown by country, and your top 5 most valuable coins — all computed from your real data. |

## How it works

```
 App (Expo / React Native)
   │  camera photo (base64)
   ▼
 Supabase Edge Function  ──►  Claude Opus 4.8 (vision)  ──►  structured JSON
   │  (holds the Anthropic API key, server-side)
   ▼
 Supabase Postgres + Storage  (per-user collection, row-level security)
```

- **Auth & data:** Supabase (email/password, Postgres, Storage).
- **AI:** Claude vision via a Supabase Edge Function, so the Anthropic API key
  is never shipped in the app. Output is constrained to a strict JSON schema.
- **No mock data:** the collection starts empty and fills from real scans.

## Setup

Running this requires connecting your own free Supabase project and an Anthropic
API key. **Follow [SETUP.md](SETUP.md)** — it walks through every step
(including getting the API key) in about 20 minutes.

Quick version, once configured:

```bash
npm install
npx expo start     # then scan the QR code with Expo Go on your iPhone
```

## A note on value estimates

The AI returns a **reasoned estimate range**, not a certified appraisal. Real
coin value depends on grade, condition, and mint mark — hard to judge from a
phone photo — and there's no live price feed. See the end of
[SETUP.md](SETUP.md) for details.

## Project structure

```
App.js                       # Auth gate + bottom-tab navigator
src/
  theme.js                   # Design tokens (dark ground, gold accent)
  lib/
    supabase.js              # Supabase client (session persistence)
    format.js                # Currency + rarity helpers
  context/
    AuthContext.js           # Session state, sign in/up/out
    CoinsContext.js          # The user's coins, shared across screens
  api/
    scan.js                  # Calls the scan-coin Edge Function
    coins.js                 # Collection CRUD + photo upload
  components/                # CoinAvatar, CoinImage, RarityBadge, DonutChart
  screens/                   # Auth, Scan, Collection, Dashboard
supabase/
  functions/scan-coin/       # Edge Function calling Claude vision
  migrations/0001_init.sql   # Tables, RLS, storage bucket
```

> App icon and splash images live in `assets/` (add `assets/icon.png`).
