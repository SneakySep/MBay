"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Circle, CircleCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toggleWatched, toggleWatchlist } from "@/app/actions/watchlist";
import { createClient } from "@/lib/supabase/client";
import type { WatchlistPayload } from "@/types/tmdb";

interface SaveMediaButtonProps {
  payload: WatchlistPayload;
  variant: "watchlist" | "watched";
  /** Whether the current user already has this row (computed on the server). */
  initialSaved: boolean;
}

/**
 * Auth-gated optimistic toggle. Logged-out users get a link to /login
 * instead of a dead button. Server Actions do the actual writes.
 */
export function SaveMediaButton({
  payload,
  variant,
  initialSaved,
}: SaveMediaButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    createClient()
      .auth.getUser()
      .then(({ data }) => active && setLoggedIn(!!data.user))
      .catch(() => active && setLoggedIn(false));
    return () => {
      active = false;
    };
  }, []);

  const isWatchlist = variant === "watchlist";
  const Icon = saved
    ? isWatchlist
      ? BookmarkCheck
      : CircleCheck
    : isWatchlist
      ? Bookmark
      : Circle;
  const label = saved
    ? isWatchlist
      ? "In Watchlist"
      : "Watched"
    : isWatchlist
      ? "Watchlist"
      : "Mark Watched";

  if (loggedIn === null) {
    return <Button variant="outline" size="lg" disabled aria-busy>Saving…</Button>;
  }

  if (!loggedIn) {
    return (
      <Button variant="outline" size="lg" asChild title="Sign in to save titles">
        <Link href={`/login?next=save`}>
          <Icon className="h-4 w-4" /> {label}
        </Link>
      </Button>
    );
  }

  const onClick = () => {
    const previous = saved;
    setError(null);
    setSaved(!saved); // optimistic
    startTransition(async () => {
      const action = isWatchlist ? toggleWatchlist : toggleWatched;
      const result = await action(payload);
      if (!result.ok) {
        setSaved(previous); // roll back on failure
        setError(result.error ?? "Failed to update — please retry.");
      } else {
        setSaved(result.exists);
      }
    });
  };

  return (
    <Button
      variant={saved ? "secondary" : "outline"}
      size="lg"
      onClick={onClick}
      disabled={isPending}
      title={error ?? undefined}
      className={error ? "ring-1 ring-destructive" : undefined}
    >
      <Icon className="h-4 w-4" /> {label}
    </Button>
  );
}
