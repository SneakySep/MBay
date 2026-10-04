"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { toggleWatched, toggleWatchlist } from "@/app/actions/watchlist";
import type { WatchlistPayload } from "@/types/tmdb";

interface RemoveSavedButtonProps {
  payload: WatchlistPayload;
  variant: "watchlist" | "watched";
}

/** Small ✕ overlay on profile cards — the saved toggle acts as a delete. */
export function RemoveSavedButton({ payload, variant }: RemoveSavedButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const action = variant === "watchlist" ? toggleWatchlist : toggleWatched;
      await action(payload);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      aria-label={`Remove ${payload.title} from ${variant}`}
      onClick={onClick}
      disabled={pending}
      className="absolute right-2 top-2 z-20 rounded-full bg-background/80 p-1.5 text-muted-foreground shadow ring-1 ring-border backdrop-blur transition hover:text-destructive disabled:opacity-50"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  );
}
