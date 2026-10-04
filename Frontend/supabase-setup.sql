-- ============================================================
-- MBay — Supabase schema setup
-- Run this in Supabase Dashboard → SQL Editor (once per project).
-- ============================================================

-- ---------- Watchlist ("save for later") ----------
create table if not exists public.watchlist (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  tmdb_id     integer not null,
  media_type  text not null check (media_type in ('movie', 'tv')),
  title       text not null,
  poster_path text,
  created_at  timestamptz not null default now(),
  unique (user_id, tmdb_id, media_type)
);

-- ---------- Watched ("finished") ----------
create table if not exists public.watched (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  tmdb_id     integer not null,
  media_type  text not null check (media_type in ('movie', 'tv')),
  title       text not null,
  poster_path text,
  created_at  timestamptz not null default now(),
  unique (user_id, tmdb_id, media_type)
);

-- Speed up per-user list queries
create index if not exists watchlist_user_idx on public.watchlist (user_id, created_at desc);
create index if not exists watched_user_idx   on public.watched   (user_id, created_at desc);

-- ---------- Row Level Security ----------
alter table public.watchlist enable row level security;
alter table public.watched   enable row level security;

-- Watchlist: users may only touch their own rows
create policy "watchlist: select own" on public.watchlist
  for select using (auth.uid() = user_id);

create policy "watchlist: insert own" on public.watchlist
  for insert with check (auth.uid() = user_id);

create policy "watchlist: delete own" on public.watchlist
  for delete using (auth.uid() = user_id);

-- Watched: users may only touch their own rows
create policy "watched: select own" on public.watched
  for select using (auth.uid() = user_id);

create policy "watched: insert own" on public.watched
  for insert with check (auth.uid() = user_id);

create policy "watched: delete own" on public.watched
  for delete using (auth.uid() = user_id);

-- ---------- Google OAuth (dashboard config, not SQL) ----------
-- 1. Supabase Dashboard → Authentication → Sign In / Up → Google
-- 2. Enable the provider and paste a Google Cloud OAuth client
--    (authorized redirect URI: <project-ref>/auth/v1/callback)
-- 3. Set Site URL = http://localhost:3000 and add
--    http://localhost:3000/auth/callback to Redirect URLs.
