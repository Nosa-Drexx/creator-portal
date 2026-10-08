"use client"

import { StaggerGroup, StaggerItem } from "@/components/shared/motion/Stagger"
import { ErrorState } from "@/components/shared/ErrorState"
import { Skeleton } from "@/components/ui/skeleton"
import { useOverview } from "@/hooks/queries/use-analytics"
import { StatCard } from "./StatCard"
import { buildStats } from "./stats-config"

const GRID = "grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"

export function StatsGrid() {
  const { data, isPending, error, refetch, isRefetching } = useOverview()

  if (isPending) {
    return (
      <div className={GRID}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[118px] rounded-2xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-surface shadow-card">
        <ErrorState compact error={error} title="Stats are unavailable" onRetry={refetch} isRetrying={isRefetching} />
      </div>
    )
  }

  return (
    <StaggerGroup className={GRID}>
      {buildStats(data).map((stat) => (
        <StaggerItem key={stat.id} className="h-full">
          <StatCard stat={stat} />
        </StaggerItem>
      ))}
    </StaggerGroup>
  )
}
