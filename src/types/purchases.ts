import type { EPurchaseSort, EPurchaseStatus } from "@/enums/purchases"

export interface Purchase {
  id: string
  content: { id: string; title: string; thumbnailKey: string | null; deleted: boolean }
  buyerName: string
  buyerEmail: string
  amountCents: number
  currency: string
  country: string
  status: EPurchaseStatus
  createdAt: string
}

export interface PurchaseListParams {
  search?: string
  status?: EPurchaseStatus
  contentId?: string
  sort?: EPurchaseSort
  order?: "asc" | "desc"
  page?: number
  limit?: number
}
