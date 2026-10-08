"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons"
import { AnimatedNumber } from "@/components/shared/motion/AnimatedNumber"
import { cn } from "@/lib/utils"
import type { StatCardData } from "./stats-config"

function ChangeChip({ change, featured }: { change: number; featured?: boolean }) {
  const up = change >= 0
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11.5px] font-bold tabular",
        featured
          ? "bg-white/10 text-white"
          : up
            ? "bg-success-surface text-success"
            : "bg-danger-surface text-danger",
      )}
    >
      <HugeiconsIcon icon={up ? ArrowUp01Icon : ArrowDown01Icon} size={12} strokeWidth={2.5} />
      {Math.abs(change).toFixed(change !== 0 && Math.abs(change) < 10 ? 1 : 0)}%
    </span>
  )
}

export function StatCard({ stat }: { stat: StatCardData }) {
  const { featured } = stat
  return (
    <div
      className={cn(
        "group relative flex h-full min-h-[118px] flex-col justify-between gap-4 overflow-hidden rounded-2xl p-4 sm:p-5",
        featured ? "bg-ink-900 text-white dark:bg-surface-raised dark:shadow-card" : "bg-surface shadow-card",
      )}
    >
      {featured && (
        <span
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-10 size-44 rounded-full bg-brand opacity-30 blur-3xl transition-opacity duration-700 group-hover:opacity-45"
        />
      )}
      <div className="relative flex items-center gap-2">
        <span
          className={cn(
            "grid size-7 place-items-center rounded-lg",
            featured ? "bg-white/10 text-white" : "bg-muted text-text-secondary",
          )}
        >
          <HugeiconsIcon icon={stat.icon} size={15} />
        </span>
        <span className={cn("text-[13px] font-medium", featured ? "text-white/70" : "text-text-secondary")}>
          {stat.label}
        </span>
      </div>
      <div className="relative flex flex-col gap-1.5">
        <AnimatedNumber
          value={stat.value}
          format={stat.format}
          className={cn("text-[22px] leading-none font-bold tracking-tight tabular sm:text-[28px]")}
        />
        <div className="flex flex-wrap items-center gap-1.5">
          {stat.change !== undefined && stat.change !== null && <ChangeChip change={stat.change} featured={featured} />}
          <span className={cn("text-xs", featured ? "text-white/55" : "text-text-tertiary")}>{stat.caption}</span>
        </div>
      </div>
    </div>
  )
}
