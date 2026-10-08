"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { fetchPurchases } from "@/services/api/purchases"
import type { PurchaseListParams } from "@/types/purchases"

export const PURCHASES_QUERY_KEY = ["purchases"] as const

export function usePurchases(params: PurchaseListParams) {
  const slug = useWorkspaceSlug()
  return useQuery({
    queryKey: [...PURCHASES_QUERY_KEY, slug, params],
    queryFn: () => fetchPurchases(slug, params),
    placeholderData: keepPreviousData,
  })
}
