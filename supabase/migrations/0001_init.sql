-- Aureus schema: per-user coin collection with row-level security,
-- plus a public bucket for coin photos.

-- ── Coins table ────────────────────────────────────────────────────────────
create table if not exists public.coins (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  country     text,
  year        text,
  metal       text,
  rarity      text not null default 'common',
  value       numeric not null default 0,   -- midpoint of the estimate, for totals
  value_low   numeric,
  value_high  numeric,
  currency    text not null default 'USD',
  confidence  numeric,
  reasoning   text,
  photo_url   text,
  created_at  timestamptz not null default now()
);

create index if not exists coins_user_id_created_at_idx
  on public.coins (user_id, created_at desc);

alter table public.coins enable row level security;

-- Each user can only see and modify their own coins.
drop policy if exists "coins_select_own" on public.coins;
create policy "coins_select_own" on public.coins
  for select using (auth.uid() = user_id);

drop policy if exists "coins_insert_own" on public.coins;
create policy "coins_insert_own" on public.coins
  for insert with check (auth.uid() = user_id);

drop policy if exists "coins_update_own" on public.coins;
create policy "coins_update_own" on public.coins
  for update using (auth.uid() = user_id);

drop policy if exists "coins_delete_own" on public.coins;
create policy "coins_delete_own" on public.coins
  for delete using (auth.uid() = user_id);

-- ── Storage bucket for coin photos ─────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('coin-photos', 'coin-photos', true)
on conflict (id) do nothing;

-- Signed-in users can upload; anyone can read (bucket is public).
drop policy if exists "coin_photos_insert" on storage.objects;
create policy "coin_photos_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'coin-photos');

drop policy if exists "coin_photos_read" on storage.objects;
create policy "coin_photos_read" on storage.objects
  for select using (bucket_id = 'coin-photos');

drop policy if exists "coin_photos_delete" on storage.objects;
create policy "coin_photos_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'coin-photos');
