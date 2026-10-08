import "server-only"

import { and, count, eq, gte, isNull, lt, sql } from "drizzle-orm"
import { EAnalyticsRange } from "@/enums/analytics"
import { EContentStatus } from "@/enums/content"
import { EPurchaseStatus } from "@/enums/purchases"
import { db } from "@/server/db/client"
import { content, purchases } from "@/server/db/schema"
import type { OverviewStats, RevenueSeries, SeriesPoint } from "@/types/analytics"
import { assertPermission } from "./permissions"
import type { TenantContext } from "./tenant"

const DAY_MS = 86_400_000

const completedIn = (workspaceId: string, from?: Date, to?: Date) =>
  and(
    eq(purchases.workspaceId, workspaceId),
    eq(purchases.status, EPurchaseStatus.Completed),
    from ? gte(purchases.createdAt, from) : undefined,
    to ? lt(purchases.createdAt, to) : undefined,
  )

async function totals(workspaceId: string, from?: Date, to?: Date) {
  const [row] = await db
    .select({
      revenueCents: sql<number>`coalesce(sum(${purchases.amountCents}), 0)`,
      purchases: count(),
    })
    .from(purchases)
    .where(completedIn(workspaceId, from, to))
  return { revenueCents: Number(row.revenueCents), purchases: row.purchases }
}

function startOfUtcMonth(date: Date, offset = 0) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1))
}

export async function getOverview(ctx: TenantContext): Promise<OverviewStats> {
  assertPermission(ctx, "view:analytics")
  const now = new Date()
  const thisMonth = startOfUtcMonth(now)
  const lastMonth = startOfUtcMonth(now, -1)
  // Compare month-to-date with the same number of days last month, not the full month
  const lastMonthToDate = new Date(Math.min(lastMonth.getTime() + (now.getTime() - thisMonth.getTime()), thisMonth.getTime()))
  const wsId = ctx.workspace.id

  const [all, current, previous, contentCounts] = await Promise.all([
    totals(wsId),
    totals(wsId, thisMonth),
    totals(wsId, lastMonth, lastMonthToDate),
    db
      .select({ status: content.status, total: count() })
      .from(content)
      .where(and(eq(content.workspaceId, wsId), isNull(content.deletedAt)))
      .groupBy(content.status),
  ])

  const totalContent = contentCounts.reduce((sum, c) => sum + c.total, 0)
  return {
    totalRevenueCents: all.revenueCents,
    revenueThisMonthCents: current.revenueCents,
    revenueLastMonthCents: previous.revenueCents,
    totalContent,
    publishedContent: contentCounts.find((c) => c.status === EContentStatus.Published)?.total ?? 0,
    totalPurchases: all.purchases,
    purchasesThisMonth: current.purchases,
    purchasesLastMonth: previous.purchases,
  }
}

const RANGE_DAYS: Record<Exclude<EAnalyticsRange, EAnalyticsRange.Year>, number> = {
  [EAnalyticsRange.Week]: 7,
  [EAnalyticsRange.Month]: 30,
  [EAnalyticsRange.Quarter]: 90,
}

function buildBuckets(range: EAnalyticsRange, now: Date) {
  if (range === EAnalyticsRange.Year) {
    const starts = Array.from({ length: 12 }, (_, i) => startOfUtcMonth(now, i - 11))
    return { bucket: "month" as const, starts, from: starts[0], format: "%Y-%m-01" }
  }
  const days = RANGE_DAYS[range]
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const starts = Array.from({ length: days }, (_, i) => new Date(today.getTime() - (days - 1 - i) * DAY_MS))
  return { bucket: "day" as const, starts, from: starts[0], format: "%Y-%m-%d" }
}

export async function getRevenueSeries(ctx: TenantContext, range: EAnalyticsRange): Promise<RevenueSeries> {
  assertPermission(ctx, "view:analytics")
  const now = new Date()
  const { bucket, starts, from, format } = buildBuckets(range, now)
  const periodMs = now.getTime() - from.getTime()
  const bucketExpr = sql<string>`strftime(${format}, ${purchases.createdAt} / 1000, 'unixepoch')`

  const [rows, previous] = await Promise.all([
    db
      .select({
        bucket: bucketExpr,
        revenueCents: sql<number>`coalesce(sum(${purchases.amountCents}), 0)`,
        purchases: count(),
      })
      .from(purchases)
      .where(completedIn(ctx.workspace.id, from))
      .groupBy(bucketExpr),
    totals(ctx.workspace.id, new Date(from.getTime() - periodMs), from),
  ])

  const byBucket = new Map(rows.map((r) => [r.bucket, r]))
  const points: SeriesPoint[] = starts.map((start) => {
    const key = start.toISOString().slice(0, 10)
    const hit = byBucket.get(key)
    return {
      date: start.toISOString(),
      revenueCents: Number(hit?.revenueCents ?? 0),
      purchases: hit?.purchases ?? 0,
    }
  })

  return {
    range,
    bucket,
    points,
    totalRevenueCents: points.reduce((s, p) => s + p.revenueCents, 0),
    totalPurchases: points.reduce((s, p) => s + p.purchases, 0),
    previousRevenueCents: previous.revenueCents,
  }
}
