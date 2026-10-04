"use client";

import { useState } from "react";
import { Play } from "lucide-react";

import { SaveMediaButton } from "@/components/save-media-button";
import { TrailerModal } from "@/components/trailer-modal";
import { Button } from "@/components/ui/button";
import type { WatchlistPayload } from "@/types/tmdb";

interface DetailActionsProps {
  trailerKey: string | null;
  title: string;
  payload: WatchlistPayload;
  inWatchlist: boolean;
  inWatched: boolean;
}

/** Trailer button + auth-gated Watchlist / Watched toggles. */
export function DetailActions({
  trailerKey,
  title,
  payload,
  inWatchlist,
  inWatched,
}: DetailActionsProps) {
  const [trailerOpen, setTrailerOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-3 pt-2">
      <Button
        size="lg"
        onClick={() => setTrailerOpen(true)}
        disabled={!trailerKey}
        title={trailerKey ? "Watch the official trailer" : "No trailer available"}
      >
        <Play className="h-4 w-4" /> Watch Trailer
      </Button>

      <SaveMediaButton payload={payload} variant="watchlist" initialSaved={inWatchlist} />
      <SaveMediaButton payload={payload} variant="watched" initialSaved={inWatched} />

      <TrailerModal
        open={trailerOpen}
        onOpenChange={setTrailerOpen}
        videoKey={trailerKey}
        title={title}
      />
    </div>
  );
}
