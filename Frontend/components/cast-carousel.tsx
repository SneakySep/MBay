import Image from "next/image";

import { tmdbImage } from "@/lib/utils";
import type { TmdbCastMember } from "@/types/tmdb";

/** Horizontal headshot strip — server-rendered, native scroll-snap. */
export function CastCarousel({ cast }: { cast: TmdbCastMember[] }) {
  const members = cast.slice(0, 14);
  if (!members.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Top Cast</h2>
      <div className="scrollbar-none flex gap-4 overflow-x-auto pb-2">
        {members.map((member, i) => {
          const image = tmdbImage(member.profile_path, "w185");
          return (
            <div key={member.credit_id ?? `${member.id}-${i}`} className="w-[120px] shrink-0 sm:w-[150px]">
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-secondary ring-1 ring-border">
                {image ? (
                  <Image
                    src={image}
                    alt={member.name}
                    fill
                    loading="lazy"
                    sizes="150px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-2 text-center text-xs text-muted-foreground">
                    {member.name}
                  </div>
                )}
              </div>
              <p className="mt-2 line-clamp-1 text-sm font-medium">{member.name}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {member.character}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
