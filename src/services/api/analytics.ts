import { apiClient, type Envelope } from "@/lib/axios"
import type { EAnalyticsRange } from "@/enums/analytics"
import type { OverviewStats, RevenueSeries } from "@/types/analytics"

export async function fetchOverview(slug: string): Promise<OverviewStats> {
  const { data } = await apiClient.get<Envelope<OverviewStats>>(`/workspaces/${slug}/analytics/overview`)
  return data.data
}

export async function fetchRevenueSeries(slug: string, range: EAnalyticsRange): Promise<RevenueSeries> {
  const { data } = await apiClient.get<Envelope<RevenueSeries>>(`/workspaces/${slug}/analytics/revenue`, {
    params: { range },
  })
  return data.data
}
