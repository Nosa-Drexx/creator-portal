import { apiClient, type Envelope } from "@/lib/axios"
import type { PaginatedResponse } from "@/types/common"
import type { Purchase, PurchaseListParams } from "@/types/purchases"

export async function fetchPurchases(slug: string, params: PurchaseListParams): Promise<PaginatedResponse<Purchase>> {
  const { data } = await apiClient.get<Envelope<PaginatedResponse<Purchase>>>(`/workspaces/${slug}/purchases`, {
    params,
  })
  return data.data
}
