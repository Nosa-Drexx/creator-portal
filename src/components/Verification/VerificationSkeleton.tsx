import { Skeleton } from "@/components/ui/skeleton"

export function VerificationSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-[420px] rounded-2xl" />
    </div>
  )
}
