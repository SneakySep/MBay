import type { Metadata } from "next";

import { discoverMovies, getGenres } from "@/lib/tmdb";
import { GenreSelect } from "@/components/filters/genre-select";
import { MediaTypeToggle } from "@/components/filters/media-type-toggle";
import { SortSelect } from "@/components/filters/sort-select";
import { MovieGrid } from "@/components/movie-grid";
import type { DiscoverParams } from "@/types/tmdb";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Browse thousands of movies and TV shows. Filter by genre, sort by rating, release date, or popularity.",
};

const ALLOWED_SORTS = new Set<string>([
  "popularity.desc",
  "vote_average.desc",
  "primary_release_date.desc",
  "first_air_date.desc",
]);

function first(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" ? v : undefined;
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const mediaType: "movie" | "tv" = first(sp.media) === "tv" ? "tv" : "movie";

  const genreRaw = first(sp.genre);
  const genre = genreRaw && /^\d+$/.test(genreRaw) ? genreRaw : "";

  const sortRaw = first(sp.sort) ?? "popularity.desc";
  const sort = ALLOWED_SORTS.has(sortRaw) ? sortRaw : "popularity.desc";

  // SSR page 1 + genre list; later pages stream from /api/tmdb/discover.
  const [data, { genres }] = await Promise.all([
    discoverMovies({
      mediaType,
      withGenres: genre ? [Number(genre)] : undefined,
      sortBy: sort as DiscoverParams["sortBy"],
    }),
    getGenres(mediaType),
  ]);

  return (
    <div className="container space-y-6 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Explore</h1>
          <p className="text-sm text-muted-foreground">
            Endless titles — filter by genre, sort by rating, release date or
            popularity.
          </p>
        </div>
        <MediaTypeToggle />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card/50 p-3">
        <GenreSelect genres={genres} />
        <SortSelect />
        <span className="ml-auto text-xs text-muted-foreground">
          {data.total_results.toLocaleString()} titles found
        </span>
      </div>

      <MovieGrid initialData={data} filters={{ mediaType, genre, sort }} />
    </div>
  );
}
