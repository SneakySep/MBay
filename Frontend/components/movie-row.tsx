"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MovieCard } from "@/components/movie-card";
import type { TmdbMovieSummary } from "@/types/tmdb";

interface MovieRowProps {
  title: string;
  items: TmdbMovieSummary[];
  fallbackMediaType?: "movie" | "tv";
}

/** Horizontal poster carousel with edge-aware scroll arrows. */
export function MovieRow({ title, items, fallbackMediaType = "movie" }: MovieRowProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  if (!items.length) return null;

  const updateArrows = () => {
    const el = scroller.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  const scrollBy = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({
      left: direction * Math.min(el.clientWidth * 0.9, 900),
      behavior: "smooth",
    });
  };

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>

      <div className="group/row relative">
        {canLeft && (
          <Button
            size="icon"
            variant="secondary"
            aria-label="Scroll left"
            className="absolute -left-4 top-[40%] z-10 hidden rounded-full shadow-xl transition-opacity group-hover/row:opacity-100 md:inline-flex"
            onClick={() => scrollBy(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        {canRight && (
          <Button
            size="icon"
            variant="secondary"
            aria-label="Scroll right"
            className="absolute -right-4 top-[40%] z-10 hidden rounded-full shadow-xl transition-opacity group-hover/row:opacity-100 md:inline-flex"
            onClick={() => scrollBy(1)}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}

        <div
          ref={scroller}
          onScroll={updateArrows}
          className="scrollbar-none flex snap-x gap-4 overflow-x-auto scroll-smooth pb-2"
        >
          {items.map((item) => (
            <MovieCard
              key={`${item.media_type ?? fallbackMediaType}-${item.id}`}
              item={item}
              fallbackMediaType={fallbackMediaType}
              className="w-[150px] shrink-0 snap-start sm:w-[185px]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
