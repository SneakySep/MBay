"use client";

import { Film, Clapperboard } from "lucide-react";

import { useFilterParam } from "@/components/filters/use-filter-param";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "movie", label: "Movies", icon: Clapperboard },
  { value: "tv", label: "TV Shows", icon: Film },
] as const;

/** Pill toggle: Movies ⇄ TV Shows (persisted as ?media=tv). */
export function MediaTypeToggle() {
  const { value, setValue, isPending } = useFilterParam("media");
  const active = value === "tv" ? "tv" : "movie";

  return (
    <div
      role="group"
      aria-label="Media type"
      className={cn(
        "inline-flex rounded-full border bg-secondary/50 p-1",
        isPending && "opacity-60",
      )}
    >
      {OPTIONS.map(({ value: v, label, icon: Icon }) => (
        <button
          key={v}
          type="button"
          onClick={() => setValue(v)}
          aria-pressed={active === v}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            active === v
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
