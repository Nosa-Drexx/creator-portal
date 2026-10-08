"use client"

import { useMemo } from "react"
import { format } from "date-fns"
import { parseAsStringEnum, useQueryState } from "nuqs"
import { ChartIncreaseIcon } from "@hugeicons/core-free-icons"
import { AreaTrendChart, type TrendPoint } from "@/components/shared/Charts/AreaTrendChart"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { AnimatedNumber } from "@/components/shared/motion/AnimatedNumber"
import { SectionCard } from "@/components/shared/SectionCard"
import { SegmentedControl } from "@/components/shared/SegmentedControl"
import { Skeleton } from "@/components/ui/skeleton"
import { EAnalyticsRange } from "@/enums/analytics"
import { useRevenueSeries } from "@/hooks/queries/use-analytics"
import { formatCompact, formatCurrency, formatPercentChange } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { RevenueSeries } from "@/types/analytics"

type Metric = "revenue" | "purchases"

const RANGE_OPTIONS = [
  { value: EAnalyticsRange.Week, label: "7D" },
  { value: EAnalyticsRange.Month, label: "30D" },
  { value: EAnalyticsRange.Quarter, label: "90D" },
  { value: EAnalyticsRange.Year, label: "12M" },
]

const RANGE_CAPTION: Record<EAnalyticsRange, string> = {
  [EAnalyticsRange.Week]: "the last 7 days",
  [EAnalyticsRange.Month]: "the last 30 days",
  [EAnalyticsRange.Quarter]: "the last 90 days",
  [EAnalyticsRange.Year]: "the last 12 months",
}

function toPoints(series: RevenueSeries, metric: Metric): TrendPoint[] {
  return series.points.map((p) => {
    const date = new Date(p.date)
    const monthly = series.bucket === "month"
    return {
      label: format(date, monthly ? "MMM" : "d MMM"),
      tooltipLabel: format(date, monthly ? "MMMM yyyy" : "EEE, d MMM yyyy"),
      value: metric === "revenue" ? p.revenueCents / 100 : p.purchases,
    }
  })
}

export function RevenueChartCard() {
  const [range, setRange] = useQueryState(
    "range",
    parseAsStringEnum(Object.values(EAnalyticsRange)).withDefault(EAnalyticsRange.Month),
  )
  const [metric, setMetric] = useQueryState(
    "metric",
    parseAsStringEnum<Metric>(["revenue", "purchases"]).withDefault("revenue"),
  )
  const { data, isPending, isPlaceholderData, error, refetch, isRefetching } = useRevenueSeries(range)

  const points = useMemo(() => (data ? toPoints(data, metric) : []), [data, metric])
  const total = metric === "revenue" ? (data?.totalRevenueCents ?? 0) / 100 : (data?.totalPurchases ?? 0)
  const change = data ? formatPercentChange(data.totalRevenueCents, data.previousRevenueCents) : null
  const isEmpty = data && data.totalPurchases === 0

  return (
    <SectionCard
      title={
        <SegmentedControl
          aria-label="Chart metric"
          size="sm"
          value={metric}
          onChange={setMetric}
          options={[
            { value: "revenue", label: "Revenue" },
            { value: "purchases", label: "Purchases" },
          ]}
        />
      }
      actions={
        <SegmentedControl aria-label="Date range" size="sm" value={range} onChange={setRange} options={RANGE_OPTIONS} />
      }
    >
      <div className="flex flex-col gap-1 px-4 pt-4 sm:px-5">
        {isPending ? (
          <Skeleton className="h-9 w-40" />
        ) : (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <AnimatedNumber
              value={total}
              format={metric === "revenue" ? { style: "currency", currency: "USD", maximumFractionDigits: 0 } : undefined}
              className="text-[28px] leading-none font-bold tracking-tight tabular"
            />
            {metric === "revenue" && change !== null && change !== 0 && (
              <span className={cn("text-[13px] font-semibold", change > 0 ? "text-success" : "text-danger")}>
                {change > 0 ? "+" : ""}
                {change.toFixed(1)}% vs previous period
              </span>
            )}
          </div>
        )}
        <p className="text-xs text-text-tertiary">
          {metric === "revenue" ? "Completed revenue" : "Completed purchases"} over {RANGE_CAPTION[range]}
        </p>
      </div>

      <div className={cn("px-1 pt-2 pb-3 transition-opacity duration-300 sm:px-3", isPlaceholderData && "opacity-50")}>
        {isPending ? (
          <Skeleton className="mx-3 h-[280px] rounded-xl" />
        ) : error ? (
          <ErrorState compact error={error} title="Chart unavailable" onRetry={refetch} isRetrying={isRefetching} />
        ) : isEmpty ? (
          <EmptyState
            compact
            icon={ChartIncreaseIcon}
            title="No sales in this period"
            description="Once buyers purchase your published videos, revenue will chart here."
            className="h-[280px]"
          />
        ) : (
          <AreaTrendChart
            data={points}
            seriesLabel={metric === "revenue" ? "Revenue" : "Purchases"}
            formatValue={(v) => (metric === "revenue" ? formatCurrency(v * 100) : `${v} purchases`)}
            formatAxis={(v) => (metric === "revenue" ? `$${formatCompact(v)}` : formatCompact(v))}
          />
        )}
      </div>
    </SectionCard>
  )
}

