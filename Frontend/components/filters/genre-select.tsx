"use client";

import { Tags } from "lucide-react";

import { useFilterParam } from "@/components/filters/use-filter-param";
import { cn } from "@/lib/utils";
import type { TmdbGenre } from "@/types/tmdb";

/** Genre dropdown fed by SSR'd TMDB genre list (?genre=<id>). */
export function GenreSelect({ genres }: { genres: TmdbGenre[] }) {
  const { value, setValue, isPending } = useFilterParam("genre");

  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 text-sm text-muted-foreground",
        isPending && "opacity-60",
      )}
    >
      <Tags className="h-4 w-4" />
      <span className="sr-only sm:not-sr-only">Genre</span>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-10 max-w-[180px] rounded-md border border-input bg-secondary/60 px-3 text-sm font-medium text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">All genres</option>
        {genres.map((g) => (
          <option key={g.id} value={String(g.id)}>
            {g.name}
          </option>
        ))}
      </select>
    </label>
  );
}
