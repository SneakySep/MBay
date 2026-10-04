import { Skeleton } from "@/components/ui/skeleton";

/** Poster-card placeholder matching MovieCard geometry (2:3 + 2 text lines). */
export function CardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}

export function CardRowSkeleton({ count = 7 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden pb-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-[150px] shrink-0 sm:w-[185px]">
          <CardSkeleton />
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 18 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
