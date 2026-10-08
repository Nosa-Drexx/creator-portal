"use client"

import { useId, useMemo } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"
import { getNiceDomainMax, getTicks } from "./chart-utils"

export interface TrendPoint {
  label: string
  tooltipLabel: string
  value: number
}

interface AreaTrendChartProps {
  data: TrendPoint[]
  formatValue: (value: number) => string
  formatAxis?: (value: number) => string
  seriesLabel: string
  height?: number
  color?: string
}

interface TooltipContentProps {
  active?: boolean
  payload?: { payload: TrendPoint }[]
  formatValue: (value: number) => string
  seriesLabel: string
}

function ChartTooltip({ active, payload, formatValue, seriesLabel }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="min-w-[150px] rounded-xl border border-stroke bg-popover px-3 py-2.5 shadow-float">
      <p className="text-xs text-text-tertiary">{point.tooltipLabel}</p>
      <div className="mt-1.5 flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5 text-xs text-text-secondary">
          <span className="size-2 rounded-full bg-brand" />
          {seriesLabel}
        </span>
        <span className="text-sm font-bold tabular text-text-primary">{formatValue(point.value)}</span>
      </div>
    </div>
  )
}

export function AreaTrendChart({
  data,
  formatValue,
  formatAxis = formatValue,
  seriesLabel,
  height = 280,
  color = "var(--brand)",
}: AreaTrendChartProps) {
  const gradientId = useId().replace(/:/g, "")
  const isMobile = useIsMobile()
  const max = useMemo(() => getNiceDomainMax(Math.max(0, ...data.map((d) => d.value))), [data])
  const tickInterval = Math.max(0, Math.ceil(data.length / (isMobile ? 4 : 8)) - 1)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--stroke)" strokeDasharray="3 4" />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          interval={tickInterval}
          tick={{ fill: "var(--text-tertiary)", fontSize: 11.5 }}
          dy={8}
        />
        <YAxis
          hide={isMobile}
          domain={[0, max]}
          ticks={getTicks(max)}
          axisLine={false}
          tickLine={false}
          width={52}
          tickFormatter={formatAxis}
          tick={{ fill: "var(--text-tertiary)", fontSize: 11.5 }}
        />
        <Tooltip
          cursor={{ stroke: "var(--stroke-strong)", strokeDasharray: "4 4" }}
          content={<ChartTooltip formatValue={formatValue} seriesLabel={seriesLabel} />}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.25}
          fill={`url(#${gradientId})`}
          animationDuration={700}
          animationEasing="ease-out"
          activeDot={{ r: 5, strokeWidth: 3, stroke: "var(--surface)", fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
