import { TableSkeleton } from "@/components/shared/DataTable"
import { Skeleton } from "@/components/ui/skeleton"

export function PurchaseListSkeleton() {
  return (
    <>
      <TableSkeleton columns={6} rows={10} className="max-md:hidden" />
      <div className="flex flex-col md:hidden" aria-busy>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-3 border-b border-stroke/70 px-4 py-3.5 last:border-0">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3.5 w-12" />
              </div>
              <Skeleton className="h-3 w-44" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export function PurchasesSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex flex-col gap-2.5 md:flex-row md:justify-between">
        <Skeleton className="h-10 w-full rounded-[10px] md:h-9 md:max-w-xs" />
        <Skeleton className="h-10 w-full rounded-[11px] md:h-9 md:w-96" />
      </div>
      <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
        <PurchaseListSkeleton />
      </div>
    </div>
  )
}
