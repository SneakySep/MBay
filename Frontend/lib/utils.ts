import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ------------------------------------------------------------------ */
/* TMDB image + formatting helpers (client-safe: no secrets imported)  */
/* ------------------------------------------------------------------ */

export type TmdbImageSize =
  | "w92"
  | "w154"
  | "w185"
  | "w342"
  | "w500"
  | "w780"
  | "w1280"
  | "original";

/** Builds a TMDB CDN url; returns null so callers can render a fallback. */
export function tmdbImage(
  path: string | null | undefined,
  size: TmdbImageSize = "w500",
): string | null {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

/** Movies use `title`, TV uses `name` — normalize for any summary/detail. */
export function getTitle(item: { title?: string | null; name?: string | null }): string {
  return item.title ?? item.name ?? "Untitled";
}

/** Movies use `release_date`, TV uses `first_air_date` — returns 'YYYY'. */
export function getReleaseYear(item: {
  release_date?: string | null;
  first_air_date?: string | null;
}): string {
  const date = item.release_date ?? item.first_air_date;
  return date ? date.slice(0, 4) : "";
}

export function formatReleaseDate(item: {
  release_date?: string | null;
  first_air_date?: string | null;
}): string {
  const date = item.release_date ?? item.first_air_date;
  if (!date) return "Unknown";
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatRuntime(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function formatRating(voteAverage: number): string {
  return voteAverage ? voteAverage.toFixed(1) : "N/A";
}

/** Canonical detail href for a movie or tv summary. */
export function mediaHref(
  id: number,
  mediaType?: "movie" | "tv" | null,
): string {
  return mediaType === "tv" ? `/tv/${id}` : `/movie/${id}`;
}

/** Infers media type from a summary (trending/all carries media_type; rows may not). */
export function mediaTypeOf(
  item: { media_type?: "movie" | "tv" },
  fallback: "movie" | "tv" = "movie",
): "movie" | "tv" {
  return item.media_type ?? fallback;
}
