import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton } from "@/components/skeletons/card-skeleton";

export default function ExploreLoading() {
  return (
    <div className="container space-y-6 py-8">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-56 rounded-full" />
      </div>
      <Skeleton className="h-16 w-full rounded-xl" />
      <CardGridSkeleton />
    </div>
  );
}
