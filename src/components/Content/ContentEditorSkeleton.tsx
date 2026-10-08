import { Skeleton } from "@/components/ui/skeleton"

export function ContentEditorSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-56" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-[340px] rounded-2xl" />
          <Skeleton className="h-[300px] rounded-2xl" />
        </div>
        <Skeleton className="hidden h-[380px] rounded-2xl lg:block" />
      </div>
    </div>
  )
}
