import { NextResponse } from "next/server";
import { discoverMovies } from "@/lib/tmdb";
import type { DiscoverParams } from "@/types/tmdb";

const ALLOWED_SORTS = new Set<string>([
  "popularity.desc",
  "vote_average.desc",
  "primary_release_date.desc",
  "first_air_date.desc",
  "revenue.desc",
]);

/**
 * GET /api/tmdb/discover?mediaType=movie|tv&page=1&genres=28,12&sort=…&year=
 * Powers the explore page infinite scroll. All inputs are whitelisted /
 * clamped before being forwarded to TMDB.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);

  const mediaType: "movie" | "tv" =
    url.searchParams.get("mediaType") === "tv" ? "tv" : "movie";

  const pageRaw = Number(url.searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageRaw) ? Math.max(1, Math.min(500, pageRaw)) : 1;

  const withGenres = (url.searchParams.get("genres") ?? "")
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);

  const sortRaw = url.searchParams.get("sort") ?? "popularity.desc";
  const sortBy = ALLOWED_SORTS.has(sortRaw)
    ? (sortRaw as NonNullable<DiscoverParams["sortBy"]>)
    : "popularity.desc";

  const yearRaw = url.searchParams.get("year");
  const year = yearRaw && /^\d{4}$/.test(yearRaw) ? Number(yearRaw) : undefined;

  try {
    const data = await discoverMovies({ mediaType, page, withGenres, sortBy, year });
    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/tmdb/discover]", error);
    return NextResponse.json(
      { page: 1, results: [], total_pages: 0, total_results: 0 },
      { status: 502 },
    );
  }
}
