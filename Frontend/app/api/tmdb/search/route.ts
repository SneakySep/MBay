import { NextResponse } from "next/server";
import { searchMovies } from "@/lib/tmdb";

/**
 * GET /api/tmdb/search?q=…&page=1
 * Search proxy for the navbar autocomplete AND the /search results grid.
 * The TMDB key stays server-side; "person" hits are stripped and the raw
 * paged envelope is returned so the client grid can paginate seamlessly.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  const pageRaw = Number(url.searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageRaw) ? Math.max(1, Math.min(500, pageRaw)) : 1;

  if (q.length < 2) {
    return NextResponse.json({ page: 1, results: [], total_pages: 0, total_results: 0 });
  }

  try {
    const data = await searchMovies(q, page);
    // /search/multi also returns people — this app only lists titles.
    const results = data.results.filter(
      (item) => (item.media_type as string | undefined) !== "person",
    );
    return NextResponse.json({ ...data, results });
  } catch (error) {
    // Search should fail softly (empty page) rather than 500 the navbar.
    console.error("[/api/tmdb/search]", error);
    return NextResponse.json({ page, results: [], total_pages: 0, total_results: 0 });
  }
}

