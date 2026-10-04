import { NextResponse } from "next/server";
import { getMoviesByCategory } from "@/lib/tmdb";
import type { MediaCategory } from "@/types/tmdb";

const ALLOWED_CATEGORIES = new Set<string>([
  "trending",
  "top_rated",
  "popular",
  "upcoming",
]);

/**
 * GET /api/tmdb/trending?category=trending&mediaType=movie&page=1
 * General-purpose row data endpoint (used for client-side row refreshes;
 * the homepage itself renders these via Server Components).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);

  const categoryRaw = url.searchParams.get("category") ?? "trending";
  const category = (
    ALLOWED_CATEGORIES.has(categoryRaw) ? categoryRaw : "trending"
  ) as MediaCategory;

  const mediaType: "movie" | "tv" =
    url.searchParams.get("mediaType") === "tv" ? "tv" : "movie";

  const pageRaw = Number(url.searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageRaw) ? Math.max(1, Math.min(500, pageRaw)) : 1;

  try {
    const data = await getMoviesByCategory(category, mediaType, page);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/tmdb/trending]", error);
    return NextResponse.json(
      { page: 1, results: [], total_pages: 0, total_results: 0 },
      { status: 502 },
    );
  }
}
