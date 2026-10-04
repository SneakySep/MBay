import { HeroSkeleton, RowSkeleton } from "@/components/skeletons/hero-skeleton";

export default function HomeLoading() {
  return (
    <>
      <HeroSkeleton />
      <div className="container space-y-12 py-10">
        <RowSkeleton />
        <RowSkeleton />
      </div>
    </>
  );
}
