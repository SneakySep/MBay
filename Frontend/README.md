# 🎬 MBay — Movie & TV Discovery

A Netflix-style discovery app built with **Next.js 15 (App Router)**, **TMDB**, **Supabase Auth**, and **Tailwind CSS** (shadcn-style UI). Movie *and* TV shows are first-class everywhere.

## Features

- **Home** — auto-rotating hero banner (Framer Motion) with trailer playback, plus Trending / Top Rated / Popular / Upcoming rows
- **Explore** — SSR first page + infinite scroll, URL-driven genre & sort filters (shareable/bookmarkable)
- **Search** — debounced navbar autocomplete + full results page with infinite scroll
- **Detail pages** — `/movie/[id]` & `/tv/[id]`: backdrop hero, metadata, cast carousel, similar titles, trailer modal
- **Watchlist & Watched** — optimistic Server Action toggles with rollback, profile tabs, one-tap remove
- **Auth** — Supabase email/password + Google OAuth, cookie-aware middleware protecting `/profile`
- **Performance** — every TMDB call cached via ISR (`next.revalidate`); the API key never reaches the browser

## Setup

1. **Install**

   ```bash
   npm install
   ```

2. **Environment** — copy the example and fill in real values:

   ```bash
   copy .env.local.example .env.local
   ```

   | Variable | Where to get it |
   | --- | --- |
   | `NEXT_PUBLIC_TMDB_API_KEY` | themoviedb.org → Settings → API → **API Key (v4 auth token)** |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same page (anon/public key) |

3. **Database** — run `supabase-setup.sql` in the Supabase SQL editor (creates `watchlist`/`watched` tables with RLS).

4. **Google OAuth (optional)** — see instructions at the bottom of `supabase-setup.sql`.

5. **Run**

   ```bash
   npm run dev      # http://localhost:3000
   npm run build    # production build
   ```

## Structure

```
app/
  page.tsx               home: hero + 4 rows (Server Components)
  explore/               filterable infinite grid (URL state)
  search/                full search results
  movie/[id]/ tv/[id]/   shared <MediaDetail> view
  login/ signup/ profile auth + user lists
  auth/callback/route.ts OAuth code exchange
  actions/watchlist.ts   optimistic toggle Server Actions
  api/tmdb/*             server-side TMDB proxies
components/              cards, rows, grid, hero, filters, UI primitives
lib/
  tmdb.ts                cached TMDB client (server-only)
  supabase/*             browser / server / middleware clients
```

## Notes

- Dark theme is the default; the whole UI is responsive down to `sm`.
- Filters live in the query string (`/explore?media=tv&genre=16&sort=vote_average.desc`).
- Infinite scroll uses an `IntersectionObserver` sentinel hitting `/api/tmdb/discover` (or `/api/tmdb/search` on the results page).
- No TMDB attribution image required — footer credit included (TMDB API terms).
