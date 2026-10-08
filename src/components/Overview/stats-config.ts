import { MoneyBag02Icon, ShoppingBag02Icon, Video01Icon, Wallet02Icon } from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"
import type { Format } from "@number-flow/react"
import { formatPercentChange } from "@/lib/format"
import type { OverviewStats } from "@/types/analytics"

export interface StatCardData {
  id: string
  label: string
  icon: IconSvgElement
  value: number
  format: Format
  prefix?: string
  change?: number | null
  caption: string
  featured?: boolean
}

const money: Format = { style: "currency", currency: "USD", maximumFractionDigits: 0 }
const count: Format = { maximumFractionDigits: 0 }

export function buildStats(stats: OverviewStats): StatCardData[] {
  return [
    {
      id: "total-revenue",
      label: "Total revenue",
      icon: MoneyBag02Icon,
      value: stats.totalRevenueCents / 100,
      format: money,
      caption: "All-time, completed purchases",
      featured: true,
    },
    {
      id: "revenue-month",
      label: "Revenue this month",
      icon: Wallet02Icon,
      value: stats.revenueThisMonthCents / 100,
      format: money,
      change: formatPercentChange(stats.revenueThisMonthCents, stats.revenueLastMonthCents),
      caption: "vs same time last month",
    },
    {
      id: "total-content",
      label: "Total content",
      icon: Video01Icon,
      value: stats.totalContent,
      format: count,
      caption: `${stats.publishedContent} published`,
    },
    {
      id: "total-purchases",
      label: "Total purchases",
      icon: ShoppingBag02Icon,
      value: stats.totalPurchases,
      format: count,
      change: formatPercentChange(stats.purchasesThisMonth, stats.purchasesLastMonth),
      caption: `Completed · ${stats.purchasesThisMonth} this month`,
    },
  ]
}
