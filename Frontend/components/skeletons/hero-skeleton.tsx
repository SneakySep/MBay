import { Skeleton } from "@/components/ui/skeleton";

/** Homepage hero placeholder: full-bleed backdrop + text column. */
export function HeroSkeleton() {
  return (
    <div className="relative h-[70vh] max-h-[640px] min-h-[420px] w-full overflow-hidden">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="absolute inset-x-0 bottom-0 space-y-4 p-6 sm:p-12">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-2/3 max-w-xl" />
        <Skeleton className="h-4 w-1/2 max-w-lg" />
        <Skeleton className="h-20 w-full max-w-xl" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/** Row placeholder with heading bar + card row. */
export function RowSkeleton({ count = 7 }: { count?: number }) {
  return (
    <section className="space-y-3">
      <Skeleton className="h-7 w-44" />
      <div className="flex gap-4 overflow-hidden pb-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="w-[150px] shrink-0 space-y-2 sm:w-[185px]">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </section>
  );
}
