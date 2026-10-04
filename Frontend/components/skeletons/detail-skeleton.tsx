import { Skeleton } from "@/components/ui/skeleton";

/** Movie-detail hero + meta placeholder. */
export function DetailSkeleton() {
  return (
    <div>
      <div className="relative h-[52vh] max-h-[560px] min-h-[360px] w-full">
        <Skeleton className="absolute inset-0" />
      </div>
      <div className="container -mt-24 space-y-6">
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-[240px] w-40 rounded-xl sm:h-[320px] sm:w-56" />
          <div className="flex-1 space-y-3 pt-24">
            <Skeleton className="h-10 w-2/3 max-w-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-32 w-full max-w-3xl" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-10 w-36 rounded-md" />
              <Skeleton className="h-10 w-36 rounded-md" />
            </div>
          </div>
        </div>
        <Skeleton className="h-7 w-40" />
        <div className="flex gap-4 overflow-hidden pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-[130px] shrink-0 space-y-2 sm:w-[160px]">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
