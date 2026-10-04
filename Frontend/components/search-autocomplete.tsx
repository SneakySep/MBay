"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_CHARS } from "@/lib/constants";
import { getReleaseYear, getTitle, mediaHref, tmdbImage } from "@/lib/utils";
import type { TmdbMovieSummary } from "@/types/tmdb";

const MAX_PREVIEW = 6;

/**
 * Navbar search with live poster-preview dropdown.
 * Debounced + abortable; Enter (or "see all") goes to /search.
 */
export function SearchAutocomplete() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbMovieSummary[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < SEARCH_MIN_CHARS) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/tmdb/search?q=${encodeURIComponent(q)}`,
          { signal: controller.signal },
        );
        const data = await res.json();
        setResults((data.results ?? []).slice(0, MAX_PREVIEW));
        setOpen(true);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Close the dropdown on outside click / Escape.
  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const trimmed = query.trim();

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={onSubmit} role="search">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => trimmed.length >= SEARCH_MIN_CHARS && setOpen(true)}
            placeholder="Search movies & TV…"
            aria-label="Search movies and TV shows"
            className="h-9 w-full bg-secondary/60 pl-9"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
      </form>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border bg-popover shadow-2xl animate-fade-in">
          <ul>
            {results.map((item) => {
              const poster = tmdbImage(item.poster_path, "w154");
              const title = getTitle(item);
              return (
                <li key={`${item.media_type ?? "movie"}-${item.id}`}>
                  <Link
                    href={mediaHref(item.id, item.media_type)}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 p-2.5 transition-colors hover:bg-accent"
                  >
                    <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-secondary">
                      {poster && (
                        <Image
                          src={poster}
                          alt={title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.media_type === "tv" ? "TV Series" : "Movie"}
                        {getReleaseYear(item) ? ` · ${getReleaseYear(item)}` : ""}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={onSubmit}
            className="w-full border-t bg-secondary/40 px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            See all results for &ldquo;{trimmed}&rdquo; →
          </button>
        </div>
      )}
    </div>
  );
}
