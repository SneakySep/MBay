import Image from "next/image";

import { CastCarousel } from "@/components/cast-carousel";
import { DetailActions } from "@/components/detail-actions";
import { MovieRow } from "@/components/movie-row";
import { Badge } from "@/components/ui/badge";
import { pickBestTrailer } from "@/lib/tmdb";
import { createClient } from "@/lib/supabase/server";
import {
  formatReleaseDate,
  formatRuntime,
  getTitle,
  tmdbImage,
} from "@/lib/utils";
import type { TmdbMovieDetails } from "@/types/tmdb";

interface MediaDetailProps {
  details: TmdbMovieDetails;
  mediaType: "movie" | "tv";
}

/** Saved-state lookup; Supabase being unconfigured must never crash the page. */
async function getSavedState(
  tmdbId: number,
  mediaType: "movie" | "tv",
): Promise<{ inWatchlist: boolean; inWatched: boolean }> {
  const empty = { inWatchlist: false, inWatched: false };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return empty;

    const [watchlist, watched] = await Promise.all([
      supabase
        .from("watchlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("tmdb_id", tmdbId)
        .eq("media_type", mediaType)
        .maybeSingle(),
      supabase
        .from("watched")
        .select("id")
        .eq("user_id", user.id)
        .eq("tmdb_id", tmdbId)
        .eq("media_type", mediaType)
        .maybeSingle(),
    ]);
    return { inWatchlist: !!watchlist.data, inWatched: !!watched.data };
  } catch {
    return empty;
  }
}

/** Shared SSR detail view for /movie/[id] and /tv/[id]. */
export async function MediaDetail({ details, mediaType }: MediaDetailProps) {
  const title = getTitle(details);
  const backdrop = tmdbImage(details.backdrop_path, "w1280");
  const poster = tmdbImage(details.poster_path, "w500");
  const trailerKey = pickBestTrailer(details.videos?.results ?? [])?.key ?? null;
  const director = details.credits?.crew.find((c) => c.job === "Director");
  const similar =
    (details.similar?.results?.length
      ? details.similar.results
      : details.recommendations?.results) ?? [];

  const { inWatchlist, inWatched } = await getSavedState(details.id, mediaType);

  const runtimeLabel =
    mediaType === "movie"
      ? formatRuntime(details.runtime)
      : details.number_of_seasons
        ? `${details.number_of_seasons} season${details.number_of_seasons > 1 ? "s" : ""}`
        : "—";

  return (
    <article>
      {/* High-res hero backdrop */}
      <div className="relative h-[52vh] max-h-[560px] min-h-[360px] w-full overflow-hidden bg-secondary">
        {backdrop && (
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
        )}
        <div className="hero-scrim absolute inset-0" />
      </div>

      <div className="container relative z-10 -mt-36 space-y-12 pb-4 sm:-mt-44">
        <div className="grid gap-8 md:grid-cols-[minmax(0,260px)_1fr] lg:gap-10">
          {/* Poster */}
          <div className="relative mx-auto aspect-[2/3] w-44 overflow-hidden rounded-xl bg-secondary shadow-2xl ring-1 ring-border sm:w-56 md:mx-0 md:w-full">
            {poster ? (
              <Image
                src={poster}
                alt={title}
                fill
                sizes="(max-width: 768px) 224px, 260px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
                {title}
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="uppercase tracking-wide">
                {mediaType === "tv" ? "TV Series" : "Movie"}
              </Badge>
              {details.status && (
                <span className="text-xs text-muted-foreground">{details.status}</span>
              )}
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              {title}
            </h1>

            {details.tagline && (
              <p className="italic text-muted-foreground">&ldquo;{details.tagline}&rdquo;</p>
            )}

            {details.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {details.genres.map((genre) => (
                  <Badge key={genre.id} variant="outline">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}

            <dl className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Rating
                </dt>
                <dd className="font-semibold">
                  ★ {details.vote_average ? details.vote_average.toFixed(1) : "—"} / 10
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    ({details.vote_count.toLocaleString()} votes)
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  {mediaType === "tv" ? "Seasons" : "Runtime"}
                </dt>
                <dd className="font-semibold">{runtimeLabel}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  {mediaType === "tv" ? "First aired" : "Released"}
                </dt>
                <dd className="font-semibold">{formatReleaseDate(details)}</dd>
              </div>
              {director && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    Director
                  </dt>
                  <dd className="font-semibold">{director.name}</dd>
                </div>
              )}
            </dl>

            <p className="max-w-3xl leading-relaxed text-muted-foreground">
              {details.overview || "No synopsis available for this title."}
            </p>

            <DetailActions
              trailerKey={trailerKey}
              title={title}
              inWatchlist={inWatchlist}
              inWatched={inWatched}
              payload={{
                tmdbId: details.id,
                mediaType,
                title,
                posterPath: details.poster_path,
              }}
            />
          </div>
        </div>

        <CastCarousel cast={details.credits?.cast ?? []} />

        {similar.length > 0 && (
          <MovieRow
            title="More Like This"
            items={similar.slice(0, 18)}
            fallbackMediaType={mediaType}
          />
        )}
      </div>
    </article>
  );
}
