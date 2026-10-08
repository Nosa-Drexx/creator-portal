import { Skeleton } from "@/components/ui/skeleton"

export function MembersSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-32 rounded-[10px]" />
      </div>
      <div className="flex flex-col gap-1 overflow-hidden rounded-2xl bg-surface p-3 shadow-card">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="hidden h-8 w-28 rounded-lg sm:block" />
          </div>
        ))}
      </div>
    </div>
  )
}
