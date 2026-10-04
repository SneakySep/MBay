"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { WatchlistPayload } from "@/types/tmdb";

export interface ToggleResult {
  ok: boolean;
  /** Final saved-state after the toggle. */
  exists: boolean;
  error?: string;
}

/**
 * Insert-or-delete one row for the signed-in user in `watchlist` or
 * `watched`. RLS in Supabase additionally enforces per-user access.
 */
async function toggle(
  table: "watchlist" | "watched",
  payload: WatchlistPayload,
): Promise<ToggleResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, exists: false, error: "You must be signed in." };

  const { data: existing } = await supabase
    .from(table)
    .select("id")
    .eq("user_id", user.id)
    .eq("tmdb_id", payload.tmdbId)
    .eq("media_type", payload.mediaType)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from(table).delete().eq("id", existing.id);
    if (error) return { ok: false, exists: true, error: error.message };
  } else {
    const { error } = await supabase.from(table).insert({
      user_id: user.id,
      tmdb_id: payload.tmdbId,
      media_type: payload.mediaType,
      title: payload.title,
      poster_path: payload.posterPath,
    });
    if (error) return { ok: false, exists: false, error: error.message };
  }

  revalidatePath("/profile");
  return { ok: true, exists: !existing };
}

export async function toggleWatchlist(payload: WatchlistPayload) {
  return toggle("watchlist", payload);
}

export async function toggleWatched(payload: WatchlistPayload) {
  return toggle("watched", payload);
}
