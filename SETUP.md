# Aureus — Setup Guide

Aureus is a real, working app: real login, real AI coin scanning, and a real
cloud-synced collection. To make it run you'll connect it to **two services you
own** (both have free tiers to start):

1. **Supabase** — accounts, database, photo storage, and the secure function
   that runs the AI.
2. **Anthropic (Claude)** — the AI that identifies coins and estimates value.

You'll need a **computer** (Mac/Windows/Linux) with [Node.js](https://nodejs.org)
installed for these steps. Budget ~20 minutes.

---

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → sign up → **New project**.
2. Pick a name and a database password (save it somewhere). Wait ~2 min for it
   to provision.
3. In the project, open **Project Settings → API** and copy two values:
   - **Project URL** (looks like `https://abcd1234.supabase.co`)
   - **anon / public** key (a long string)

## 2. Point the app at Supabase

In the project folder:

```bash
cp .env.example .env
```

Open `.env` and paste your two values:

```
EXPO_PUBLIC_SUPABASE_URL=https://abcd1234.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

> These anon values are *public* by design — safe to keep in the app. Your
> Anthropic key is **not** here; it stays server-side (step 5).

## 3. Create the database tables

In Supabase, open the **SQL Editor → New query**, paste the entire contents of
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), and
click **Run**. This creates the `coins` table (with row-level security so each
user only sees their own coins) and the `coin-photos` storage bucket.

## 4. Get an Anthropic (Claude) API key

1. Go to [console.anthropic.com](https://console.anthropic.com) and sign up.
2. **Billing → add a payment method** and a little credit (scans cost roughly a
   cent or two each).
3. **API Keys → Create Key**, name it "Aureus", and copy it
   (starts with `sk-ant-...`). You won't be able to see it again, so paste it
   somewhere safe for the next step.

## 5. Deploy the scan function (with your Claude key)

Install the Supabase CLI and log in
([full docs](https://supabase.com/docs/guides/cli)):

```bash
npm install -g supabase
supabase login
```

Link your project (find the ref in your Supabase URL, e.g. `abcd1234`):

```bash
supabase link --project-ref abcd1234
```

Store your Claude key as a **secret** (this is what keeps it off the phone) and
deploy the function:

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here
supabase functions deploy scan-coin
```

> Prefer clicking? You can also create the function and set the
> `ANTHROPIC_API_KEY` secret from the Supabase dashboard under
> **Edge Functions**.

## 6. Run the app

```bash
npm install
npx expo start
```

- **On your iPhone:** install **Expo Go** from the App Store, then scan the QR
  code in the terminal (phone and computer on the same Wi-Fi; use
  `npx expo start --tunnel` if that's a problem).
- Create an account in the app, allow camera access, point it at a coin, and
  tap the gold button.

> **Email confirmation:** by default Supabase emails a confirmation link on
> sign-up. For faster testing, turn it off under
> **Authentication → Providers → Email → "Confirm email"** (off), or just click
> the link in the email before signing in.

---

## How value estimates work (and their limits)

The scanner sends your photo to Claude, which identifies the coin and returns a
**reasoned estimate range** from its knowledge of the coin market. It is **not**
a certified appraisal: real value depends heavily on **grade, condition, and
mint mark**, which are hard to judge from a single phone photo, and it doesn't
read a live price feed. Treat the range as a well-informed ballpark. For a true
market price, have the coin professionally graded (PCGS/NGC) or checked against
recent auction results.

## Costs

- **Supabase** free tier is plenty for personal use.
- **Anthropic** is pay-as-you-go — each scan is about **1–3¢** (one image + a
  small response). You control spend with a billing limit in the Anthropic
  console.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| App shows "Backend not configured" | `.env` is missing or has placeholder values — recheck step 2, then restart `expo start`. |
| "Server is missing ANTHROPIC_API_KEY" when scanning | The secret wasn't set — rerun `supabase secrets set ANTHROPIC_API_KEY=...` and `supabase functions deploy scan-coin`. |
| Sign-up seems stuck | Email confirmation is on — check your inbox or disable it (see note above). |
| Scan fails with an auth error | The function requires a logged-in user; make sure you're signed in. |
