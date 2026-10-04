import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookmarkCheck, CheckCircle2 } from "lucide-react";

import { MovieCard } from "@/components/movie-card";
import { RemoveSavedButton } from "@/components/remove-saved-button";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";
import type { SavedMedia, TmdbMovieSummary } from "@/types/tmdb";

export const metadata: Metadata = { title: "Profile" };

/** Project a Supabase row back into the shape MovieCard renders. */
function toSummary(item: SavedMedia): TmdbMovieSummary {
  return {
    id: item.tmdb_id,
    media_type: item.media_type,
    title: item.title,
    overview: "",
    poster_path: item.poster_path,
    backdrop_path: null,
    vote_average: 0,
    vote_count: 0,
    popularity: 0,
    original_language: "en",
  };
}

function SavedGrid({
  items,
  variant,
  emptyLabel,
}: {
  items: SavedMedia[];
  variant: "watchlist" | "watched";
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/explore">Explore titles</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {items.map((item) => (
        <div key={item.id} className="relative">
          <MovieCard item={toSummary(item)} />
          <RemoveSavedButton
            variant={variant}
            payload={{
              tmdbId: item.tmdb_id,
              mediaType: item.media_type,
              title: item.title,
              posterPath: item.poster_path,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/profile");

  const [watchlistRes, watchedRes] = await Promise.all([
    supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("watched")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const watchlist = (watchlistRes.data ?? []) as SavedMedia[];
  const watched = (watchedRes.data ?? []) as SavedMedia[];

  return (
    <div className="container space-y-8 py-10">
      <header className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-xl font-bold text-primary ring-1 ring-primary/30">
          {user.email?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Your lists</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </header>

      <Tabs defaultValue="watchlist">
        <TabsList>
          <TabsTrigger value="watchlist" className="gap-1.5">
            <BookmarkCheck className="h-4 w-4" /> Watchlist
            <span className="text-xs text-muted-foreground">({watchlist.length})</span>
          </TabsTrigger>
          <TabsTrigger value="watched" className="gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Watched
            <span className="text-xs text-muted-foreground">({watched.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="watchlist" className="pt-4">
          <SavedGrid
            items={watchlist}
            variant="watchlist"
            emptyLabel="Nothing on your watchlist yet — tap the bookmark on any title."
          />
        </TabsContent>

        <TabsContent value="watched" className="pt-4">
          <SavedGrid
            items={watched}
            variant="watched"
            emptyLabel="No watched titles yet — mark titles you've finished."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
