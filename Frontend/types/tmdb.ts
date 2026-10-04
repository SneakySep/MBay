/**
 * TypeScript interfaces for TMDB API v3 responses.
 * Docs: https://developer.themoviedb.org/reference
 */

/** Shared paged envelope returned by most TMDB endpoints. */
export interface TmdbPaged<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

/** Movie / TV summary returned in lists (trending, search, discover, similar). */
export interface TmdbMovieSummary {
  id: number;
  title?: string; // movies
  name?: string; // TV shows
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type?: "movie" | "tv"; // present on /trending/all results
  genre_ids?: number[]; // lists carry IDs only; details carry full objects
  release_date?: string; // movies — 'YYYY-MM-DD'
  first_air_date?: string; // TV shows
  vote_average: number; // 0–10
  vote_count: number;
  popularity: number;
  original_language: string;
  adult?: boolean;
}

/** Full details returned by GET /movie/{id} or /tv/{id} (with append_to_response). */
export interface TmdbMovieDetails extends TmdbMovieSummary {
  genres: TmdbGenre[];
  runtime: number | null; // minutes (null for TV)
  episode_run_time?: number[]; // TV
  status: string; // 'Released' | 'In Production' ...
  tagline?: string;
  budget?: number;
  revenue?: number;
  homepage?: string | null;
  imdb_id?: string | null;
  spoken_languages?: { iso_639_1: string; name: string }[];
  production_companies?: TmdbProductionCompany[];
  countries_of_origin?: string[]; // TV
  number_of_seasons?: number; // TV
  number_of_episodes?: number; // TV
  seasons?: TmdbSeason[]; // TV
  credits?: TmdbCredits; // appended via append_to_response
  videos?: TmdbVideoResults; // appended via append_to_response
  images?: { backdrops?: TmdbImage[]; posters?: TmdbImage[] };
  similar?: TmdbPaged<TmdbMovieSummary>;
  recommendations?: TmdbPaged<TmdbMovieSummary>;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface TmdbCredits {
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export interface TmdbCastMember {
  id: number;
  name: string;
  original_name?: string;
  character: string;
  order: number;
  profile_path: string | null;
  credit_id: string;
  known_for_department?: string;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
  credit_id: string;
}

export interface TmdbVideoResults {
  results: TmdbVideo[];
}

export interface TmdbVideo {
  id: string; // YouTube video id — use directly in embed URL
  key: string;
  name: string;
  site: "YouTube";
  size: 1080 | 720 | 480;
  type: "Trailer" | "Teaser" | "Clip" | "Featurette" | "Behind The Scenes";
  official: boolean;
  published_at: string;
}

export interface TmdbImage {
  iso_639_1: string | null;
  aspect_ratio: number;
  file_path: string;
  width: number;
  height: number;
}

export interface TmdbSeason {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
  air_date: string | null;
  overview?: string;
}

/** Query parameters the /explore page can send through to TMDB /discover. */
export interface DiscoverParams {
  mediaType: "movie" | "tv";
  page?: number;
  withGenres?: number[];
  sortBy?:
    | "popularity.desc"
    | "vote_average.desc"
    | "primary_release_date.desc"
    | "first_air_date.desc"
    | "revenue.desc";
  minVoteCount?: number; // keeps 'Top Rated' sort from surfacing obscure titles
  year?: number;
}

/** Row category rendered on the homepage. */
export type MediaCategory = "trending" | "top_rated" | "popular" | "upcoming";

/** Shape stored in Supabase `watchlist` / `watched` tables + passed to Server Actions. */
export interface WatchlistPayload {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
}

/** A watchlist/watched row as returned from Supabase. */
export interface SavedMedia {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  created_at: string;
}

/** Hero banner item: a trending summary enriched with a trailer key. */
export interface HeroItem extends TmdbMovieSummary {
  trailerKey: string | null;
}
