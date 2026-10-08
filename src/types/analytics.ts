import type { EAnalyticsRange } from "@/enums/analytics"

export interface OverviewStats {
  totalRevenueCents: number
  revenueThisMonthCents: number
  revenueLastMonthCents: number
  totalContent: number
  publishedContent: number
  totalPurchases: number
  purchasesThisMonth: number
  purchasesLastMonth: number
}

export interface SeriesPoint {
  /** ISO date of the bucket start */
  date: string
  revenueCents: number
  purchases: number
}

export interface RevenueSeries {
  range: EAnalyticsRange
  bucket: "day" | "month"
  points: SeriesPoint[]
  totalRevenueCents: number
  totalPurchases: number
  previousRevenueCents: number
}
