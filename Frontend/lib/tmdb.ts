import "server-only";
import type {
  DiscoverParams,
  MediaCategory,
  TmdbGenre,
  TmdbMovieDetails,
  TmdbMovieSummary,
  TmdbPaged,
  TmdbVideo,
  TmdbVideoResults,
} from "@/types/tmdb";

const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY; // v4 read token — never sent to the browser

/** Error thrown when a TMDB request fails or the key is missing. */
export class TmdbApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "TmdbApiError";
  }
}

/**
 * Core fetch wrapper — server-only. `next.revalidate` provides ISR-style
 * caching so repeated views never re-hit TMDB (stays under rate limits).
 */
async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
  revalidate = 3600,
): Promise<T> {
  if (!API_KEY || API_KEY.startsWith("your_")) {
    throw new TmdbApiError(
      "TMDB_API_KEY is not set. Copy .env.local.example values into .env.local.",
    );
  }

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("language", "en-US");
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    next: { revalidate },
  });

  if (!res.ok) {
    throw new TmdbApiError(
      `TMDB request failed: ${res.status} ${res.statusText} (${path})`,
      res.status,
    );
  }
  return res.json() as Promise<T>;
}

/** Trending / top rated / popular / upcoming — movies or TV. */
export function getMoviesByCategory(
  category: MediaCategory,
  mediaType: "movie" | "tv" = "movie",
  page = 1,
): Promise<TmdbPaged<TmdbMovieSummary>> {
  const routes: Record<MediaCategory, string> = {
    trending: `/trending/${mediaType}/week`,
    top_rated: `/${mediaType}/top_rated`,
    popular: `/${mediaType}/popular`,
    upcoming: `/${mediaType}/upcoming`,
  };
  // TMDB has no /tv/upcoming — on-the-air is the closest equivalent.
  const path =
    mediaType === "tv" && category === "upcoming" ? "/tv/on_the_air" : routes[category];
  return tmdbFetch<TmdbPaged<TmdbMovieSummary>>(path, { page }, 1800);
}

/** Trending across all media types — powers the animated hero banner. */
export function getTrendingAll(page = 1): Promise<TmdbPaged<TmdbMovieSummary>> {
  return tmdbFetch<TmdbPaged<TmdbMovieSummary>>("/trending/all/week", { page }, 1800);
}

/* ------------------------------------------------------------------ */
/* Detail pages (single round trip via append_to_response)             */
/* ------------------------------------------------------------------ */

export function getMovieDetails(
  id: string | number,
  mediaType: "movie" | "tv" = "movie",
): Promise<TmdbMovieDetails> {
  return tmdbFetch<TmdbMovieDetails>(`/${mediaType}/${id}`, {
    append_to_response: "credits,videos,similar,recommendations,images",
  });
}

export function getSimilarMovies(
  id: string | number,
  mediaType: "movie" | "tv" = "movie",
): Promise<TmdbPaged<TmdbMovieSummary>> {
  return tmdbFetch<TmdbPaged<TmdbMovieSummary>>(`/${mediaType}/${id}/similar`);
}

/** Lightweight videos-only fetch — enriches hero items with a trailer. */
export function getVideos(
  id: string | number,
  mediaType: "movie" | "tv" = "movie",
): Promise<TmdbVideoResults> {
  return tmdbFetch<TmdbVideoResults>(`/${mediaType}/${id}/videos`, {}, 86_400);
}

/** Chooses the best YouTube trailer from a list of videos. */
export function pickBestTrailer(videos: TmdbVideo[]): TmdbVideo | null {
  const yt = videos.filter((v) => v.site === "YouTube");
  return (
    yt.find((v) => v.type === "Trailer" && v.official) ??
    yt.find((v) => v.type === "Trailer") ??
    yt.find((v) => v.type === "Teaser") ??
    yt[0] ??
    null
  );
}

/* ------------------------------------------------------------------ */
/* Search & discovery                                                  */
/* ------------------------------------------------------------------ */

/** Live autocomplete — 5-minute cache keeps results fresh but cheap. */
export function searchMovies(
  query: string,
  page = 1,
): Promise<TmdbPaged<TmdbMovieSummary>> {
  return tmdbFetch<TmdbPaged<TmdbMovieSummary>>(
    "/search/multi",
    { query, page, include_adult: false },
    300,
  );
}

/** Filtered/sorted catalog behind the /explore page. */
export function discoverMovies(
  params: DiscoverParams,
): Promise<TmdbPaged<TmdbMovieSummary>> {
  const {
    mediaType,
    page = 1,
    withGenres,
    sortBy = "popularity.desc",
    minVoteCount,
    year,
  } = params;

  const query: Record<string, string | number | boolean | undefined> = {
    page,
    with_genres: withGenres?.length ? withGenres.join(",") : undefined,
    // TV has no primary_release_date — swap the sort field accordingly.
    sort_by:
      mediaType === "tv" && sortBy === "primary_release_date.desc"
        ? "first_air_date.desc"
        : sortBy,
    // Rating sort needs a vote-count floor or obscure 10/10 titles rank first.
    vote_count_gte:
      minVoteCount ?? (sortBy.startsWith("vote_average") ? 500 : undefined),
  };

  if (year) {
    if (mediaType === "movie") query.primary_release_year = year;
    else query.first_air_date_year = year;
  }

  return tmdbFetch<TmdbPaged<TmdbMovieSummary>>(`/discover/${mediaType}`, query, 1800);
}

/** Genre list for the explore filter dropdown — cached a full day. */
export function getGenres(
  mediaType: "movie" | "tv" = "movie",
): Promise<{ genres: TmdbGenre[] }> {
  return tmdbFetch<{ genres: TmdbGenre[] }>(`/genre/${mediaType}/list`, {}, 86_400);
}
