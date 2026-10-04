import {
  getMoviesByCategory,
  getTrendingAll,
  getVideos,
  pickBestTrailer,
} from "@/lib/tmdb";
import { HERO_COUNT, ROW_LIMIT } from "@/lib/constants";
import { HeroBanner } from "@/components/hero-banner";
import { MovieRow } from "@/components/movie-row";
import type { HeroItem, TmdbPaged, TmdbMovieSummary } from "@/types/tmdb";

/**
 * Render per request so `next build` never needs live TMDB keys — the
 * underlying fetches are still ISR-cached (next.revalidate) in lib/tmdb.ts.
 */
export const dynamic = "force-dynamic";

/** Enrich the top trending titles with their best YouTube trailer key. */
async function buildHeroItems(): Promise<HeroItem[]> {
  const { results } = await getTrendingAll();
  const candidates = results
    .filter((m) => m.backdrop_path && m.overview)
    .slice(0, HERO_COUNT);

  const videoResults = await Promise.allSettled(
    candidates.map((m) => getVideos(m.id, m.media_type === "tv" ? "tv" : "movie")),
  );

  return candidates.map((item, i) => {
    const videos = videoResults[i];
    const trailerKey =
      videos.status === "fulfilled" ? pickBestTrailer(videos.value.results)?.key ?? null : null;
    return { ...item, trailerKey };
  });
}

export default async function HomePage() {
  const [hero, trending, topRated, popular, upcoming] = await Promise.all([
    buildHeroItems(),
    getMoviesByCategory("trending"),
    getMoviesByCategory("top_rated"),
    getMoviesByCategory("popular"),
    getMoviesByCategory("upcoming"),
  ]);

  const row = (data: TmdbPaged<TmdbMovieSummary>) => data.results.slice(0, ROW_LIMIT);

  return (
    <>
      <HeroBanner items={hero} />

      <div className="container space-y-12 py-10">
        <MovieRow title="Trending Now" items={row(trending)} />
        <MovieRow title="Top Rated" items={row(topRated)} />
        <MovieRow title="Popular" items={row(popular)} />
        <MovieRow title="Upcoming" items={row(upcoming)} />
      </div>
    </>
  );
}
