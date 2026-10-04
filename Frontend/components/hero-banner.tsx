"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Info, Play, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrailerModal } from "@/components/trailer-modal";
import {
  cn,
  formatRating,
  getReleaseYear,
  getTitle,
  mediaHref,
  tmdbImage,
} from "@/lib/utils";
import type { HeroItem } from "@/types/tmdb";

const AUTOPLAY_MS = 7000;

/**
 * Auto-rotating hero: crossfading backdrops + slide-in copy powered by
 * Framer Motion. "Watch Trailer" opens the shared TrailerModal; autoplay
 * pauses while the modal is open.
 */
export function HeroBanner({ items }: { items: HeroItem[] }) {
  const [index, setIndex] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const next = useCallback(
    () => setIndex((i) => (items.length ? (i + 1) % items.length : 0)),
    [items.length],
  );

  useEffect(() => {
    if (items.length <= 1 || trailerOpen) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [next, items.length, trailerOpen]);

  if (!items.length) return null;

  const item = items[index];
  const title = getTitle(item);
  const backdrop = tmdbImage(item.backdrop_path, "w1280");

  return (
    <section className="relative h-[78vh] max-h-[680px] min-h-[460px] w-full overflow-hidden bg-secondary">
      {/* Backdrop crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${item.id}`}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {backdrop ? (
            <Image
              src={backdrop}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
            />
          ) : null}
          <div className="hero-scrim absolute inset-0" />
          <div className="side-scrim absolute inset-0" />
        </motion.div>
      </AnimatePresence>

      {/* Copy slide-in */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="container relative z-10 pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={`copy-${item.id}`}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="max-w-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Trending now · #{index + 1}
                </span>
                <Badge variant="secondary" className="uppercase">
                  {item.media_type === "tv" ? "TV" : "Movie"}
                </Badge>
              </div>

              <h1 className="text-4xl font-extrabold leading-tight tracking-tight drop-shadow-lg sm:text-6xl">
                {title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  {formatRating(item.vote_average)}
                </span>
                <span>{getReleaseYear(item) || "—"}</span>
              </div>

              <p className="line-clamp-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {item.overview}
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <Button
                  size="lg"
                  onClick={() => setTrailerOpen(true)}
                  disabled={!item.trailerKey}
                  title={item.trailerKey ? "Watch the official trailer" : "No trailer available"}
                >
                  <Play className="h-4 w-4" /> Watch Trailer
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href={mediaHref(item.id, item.media_type)}>
                    <Info className="h-4 w-4" /> More Info
                  </Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slide dots */}
          <div className="mt-8 flex gap-2">
            {items.map((hero, i) => (
              <button
                key={hero.id}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === index ? "w-8 bg-primary" : "w-4 bg-white/30 hover:bg-white/60",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <TrailerModal
        open={trailerOpen}
        onOpenChange={setTrailerOpen}
        videoKey={item.trailerKey}
        title={title}
      />
    </section>
  );
}
