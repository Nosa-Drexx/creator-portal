import { Skeleton } from "@/components/ui/skeleton"

export function ContentDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-2/3" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-5">
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
        <div className="flex flex-col gap-5">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
