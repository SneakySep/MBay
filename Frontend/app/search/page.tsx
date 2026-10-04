import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { searchMovies } from "@/lib/tmdb";
import { MovieGrid } from "@/components/movie-grid";
import type { TmdbPaged, TmdbMovieSummary } from "@/types/tmdb";

function first(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const q = first((await searchParams).q).trim();
  return { title: q ? `Search: ${q}` : "Search" };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const q = first((await searchParams).q).trim();
  if (!q) redirect("/");

  let data: TmdbPaged<TmdbMovieSummary> = {
    page: 1,
    results: [],
    total_pages: 0,
    total_results: 0,
  };
  let failed = false;

  try {
    data = await searchMovies(q);
  } catch (error) {
    // Fail softly — the grid shows an empty state instead of an error page.
    console.error("[/search]", error);
    failed = true;
  }

  return (
    <div className="container space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Results for{" "}
          <span className="text-primary">&ldquo;{q}&rdquo;</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {failed
            ? "Search is temporarily unavailable — try again shortly."
            : `${data.total_results.toLocaleString()} titles found`}
        </p>
      </div>

      <MovieGrid
        initialData={data}
        filters={{ mediaType: "movie", genre: "", sort: "" }}
        searchQuery={q}
      />
    </div>
  );
}
