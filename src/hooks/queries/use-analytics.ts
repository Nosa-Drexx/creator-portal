"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { EAnalyticsRange } from "@/enums/analytics"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { fetchOverview, fetchRevenueSeries } from "@/services/api/analytics"

export const ANALYTICS_QUERY_KEY = ["analytics"] as const

export function useOverview() {
  const slug = useWorkspaceSlug()
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, slug, "overview"],
    queryFn: () => fetchOverview(slug),
  })
}

export function useRevenueSeries(range: EAnalyticsRange) {
  const slug = useWorkspaceSlug()
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, slug, "revenue", range],
    queryFn: () => fetchRevenueSeries(slug, range),
    placeholderData: keepPreviousData,
  })
}
