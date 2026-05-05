import { Card, CardContent } from "@repo/design-system/components/ui/card";
import { Skeleton } from "@repo/design-system/components/ui/skeleton";

function SkeletonCard() {
  return (
    <Card className="rounded-[1.35rem] border-border/70 py-0">
      <CardContent className="space-y-5 px-5 py-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:justify-between">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-72" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-28 w-full max-w-sm rounded-2xl" />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
        <Skeleton className="h-32 rounded-2xl" />
      </CardContent>
    </Card>
  );
}

export function CustomerOrdenesSkeleton() {
  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-muted)_28%,var(--color-background)_72%)_0%,var(--color-background)_26rem)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-12 w-56" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        </div>
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
