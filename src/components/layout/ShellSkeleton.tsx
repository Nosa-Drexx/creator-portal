import { Skeleton } from "@/components/ui/skeleton"

export function SidebarSkeleton() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[72px] shrink-0 flex-col gap-5 border-r border-stroke px-3 py-4 md:flex lg:w-[252px] lg:px-4">
      <div className="flex items-center gap-2.5 p-1.5">
        <Skeleton className="size-8 rounded-[9px]" />
        <Skeleton className="hidden h-4 w-28 lg:block" />
      </div>
      <Skeleton className="h-10 w-full rounded-[10px]" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded-[10px]" />
        ))}
      </div>
    </aside>
  )
}
