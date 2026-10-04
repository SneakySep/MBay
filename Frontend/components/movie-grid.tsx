"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { MovieCard } from "@/components/movie-card";
import { CardSkeleton } from "@/components/skeletons/card-skeleton";
import type { TmdbMovieSummary, TmdbPaged } from "@/types/tmdb";

export interface MovieGridFilters {
  mediaType: "movie" | "tv";
  genre: string;
  sort: string;
}

interface MovieGridProps {
  initialData: TmdbPaged<TmdbMovieSummary>;
  filters: MovieGridFilters;
  /** When set, pages come from /api/tmdb/search instead of /discover. */
  searchQuery?: string;
}

/**
 * Responsive poster grid with IntersectionObserver infinite scroll.
 * Filter changes arrive as fresh SSR `initialData` + a new filterKey,
 * which resets local paging.
 */
export function MovieGrid({ initialData, filters, searchQuery }: MovieGridProps) {
  const [items, setItems] = useState<TmdbMovieSummary[]>(initialData.results);
  const [hasMore, setHasMore] = useState(
    initialData.page < initialData.total_pages,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinel = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stateRef = useRef({ filters, searchQuery, page: initialData.page });
  stateRef.current = {
    filters,
    searchQuery,
    page: Math.max(stateRef.current.page, initialData.page),
  };

  const filterKey = `${searchQuery ?? ""}|${filters.mediaType}|${filters.genre}|${filters.sort}`;
  const filterKeyRef = useRef(filterKey);

  // Reset paging whenever the effective filter/search changes.
  useEffect(() => {
    if (filterKeyRef.current === filterKey) return;
    filterKeyRef.current = filterKey;
    setItems(initialData.results);
    setHasMore(initialData.page < initialData.total_pages);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const buildUrl = useCallback((page: number) => {
    const { filters: f, searchQuery: q } = stateRef.current;
    const params = new URLSearchParams({ page: String(page) });
    if (q) {
      params.set("q", q);
      return `/api/tmdb/search?${params}`;
    }
    params.set("mediaType", f.mediaType);
    if (f.genre) params.set("genres", f.genre);
    if (f.sort) params.set("sort", f.sort);
    return `/api/tmdb/discover?${params}`;
  }, []);

  const loadPage = useCallback(async (page: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    try {
      const res = await fetch(buildUrl(page), { signal: controller.signal });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data: TmdbPaged<TmdbMovieSummary> = await res.json();

      setItems((prev) =>
        page === 1 ? data.results : [...prev, ...data.results],
      );
      stateRef.current.page = data.page;
      setHasMore(data.page < data.total_pages);
      setError(null);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Could not load more titles — please try again.");
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [buildUrl]);

  const loadPageRef = useRef(loadPage);
  loadPageRef.current = loadPage;

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loading) {
          void loadPageRef.current(stateRef.current.page + 1);
        }
      },
      { rootMargin: "600px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, filterKey]);

  if (!items.length && !loading) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
        {error ?? "No titles matched — try different filters."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item) => (
          <MovieCard
            key={`${item.media_type ?? ""}-${item.id}`}
            item={item}
            fallbackMediaType={filters.mediaType}
          />
        ))}
        {loading &&
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>

      {error && <p className="text-center text-sm text-destructive">{error}</p>}

      {/* Infinite-scroll sentinel */}
      {hasMore && <div ref={sentinel} className="h-2" aria-hidden />}

      {!hasMore && (
        <p className="text-center text-sm text-muted-foreground">
          You&apos;ve reached the end.
        </p>
      )}

      {loading && (
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading more titles…
        </p>
      )}
    </div>
  );
}
