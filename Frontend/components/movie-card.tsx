import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  cn,
  getReleaseYear,
  getTitle,
  mediaHref,
  tmdbImage,
} from "@/lib/utils";
import type { TmdbMovieSummary } from "@/types/tmdb";

interface MovieCardProps {
  item: TmdbMovieSummary;
  /** Used when the payload has no media_type (e.g. /movie/popular rows). */
  fallbackMediaType?: "movie" | "tv";
  className?: string;
}

/**
 * Poster card: image, title, release year and a floating rating badge.
 * Server-render friendly — no client hooks.
 */
export function MovieCard({
  item,
  fallbackMediaType = "movie",
  className,
}: MovieCardProps) {
  const title = getTitle(item);
  const year = getReleaseYear(item);
  const poster = tmdbImage(item.poster_path, "w342");
  const href = mediaHref(item.id, item.media_type ?? fallbackMediaType);

  return (
    <Link
      href={href}
      className={cn("group relative block outline-none", className)}
      title={title}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-secondary ring-1 ring-border transition-all duration-300 group-hover:ring-primary/60">
        {poster ? (
          <Image
            src={poster}
            alt={title}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 200px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-3 text-center text-xs text-muted-foreground">
            {title}
          </div>
        )}

        <Badge className="absolute right-1.5 top-1.5 gap-1 border-0 bg-black/75 text-white shadow backdrop-blur">
          <Star className="h-3 w-3 fill-primary text-primary" />
          {item.vote_average ? item.vote_average.toFixed(1) : "—"}
        </Badge>
      </div>

      <div className="mt-2 space-y-0.5">
        <p className="line-clamp-1 text-sm font-medium transition-colors group-hover:text-primary">
          {title}
        </p>
        <p className="text-xs text-muted-foreground">{year || "—"}</p>
      </div>
    </Link>
  );
}
