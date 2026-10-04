"use client";

import { ArrowUpDown } from "lucide-react";

import { useFilterParam } from "@/components/filters/use-filter-param";
import { SORT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Sort dropdown: Popularity / Rating / Release Date (?sort=…). */
export function SortSelect() {
  const { value, setValue, isPending } = useFilterParam("sort");
  const current = SORT_OPTIONS.some((o) => o.value === value)
    ? value
    : "popularity.desc";

  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 text-sm text-muted-foreground",
        isPending && "opacity-60",
      )}
    >
      <ArrowUpDown className="h-4 w-4" />
      <span className="sr-only sm:not-sr-only">Sort by</span>
      <select
        value={current}
        onChange={(e) => setValue(e.target.value)}
        className="h-10 rounded-md border border-input bg-secondary/60 px-3 text-sm font-medium text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
