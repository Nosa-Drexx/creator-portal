import { Skeleton } from "@/components/ui/skeleton"
import { TableSkeleton } from "@/components/shared/DataTable"

export function ContentListSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy>
      <Skeleton className="h-8 w-40" />
      <div className="flex justify-between gap-3">
        <Skeleton className="h-9 w-80 rounded-xl" />
        <Skeleton className="hidden h-9 w-64 rounded-xl md:block" />
      </div>
      <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
        <TableSkeleton columns={5} rows={6} />
      </div>
    </div>
  )
}
