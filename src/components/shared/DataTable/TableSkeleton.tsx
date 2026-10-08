import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface TableSkeletonProps {
  columns?: number
  rows?: number
  className?: string
}

const WIDTHS = ["w-40", "w-24", "w-16", "w-28", "w-20"]

export function TableSkeleton({ columns = 5, rows = 8, className }: TableSkeletonProps) {
  return (
    <div className={cn("w-full", className)} aria-busy aria-label="Loading">
      <div className="flex h-10 items-center gap-6 border-b border-stroke px-5">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className={cn("h-3", i === 0 ? "w-24 flex-[2]" : "w-14 flex-1")} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex h-[60px] items-center gap-6 border-b border-stroke/70 px-5 last:border-0">
          {Array.from({ length: columns }).map((_, c) => (
            <div key={c} className={cn("flex items-center gap-3", c === 0 ? "flex-[2]" : "flex-1")}>
              {c === 0 && <Skeleton className="size-8 shrink-0 rounded-full" />}
              <Skeleton className={cn("h-3.5", WIDTHS[(r + c) % WIDTHS.length])} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
