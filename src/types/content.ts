import type { EContentStatus } from "@/enums/content"

export interface Content {
  id: string
  title: string
  description: string
  priceCents: number
  thumbnailKey: string | null
  videoKey: string | null
  videoFileName: string | null
  videoSizeBytes: number | null
  durationSeconds: number | null
  status: EContentStatus
  scheduledFor: string | null
  publishedAt: string | null
  /** null when the member's role can't see performance data */
  views: number | null
  purchases: number | null
  revenueCents: number | null
  createdAt: string
  updatedAt: string
}

export interface ContentListParams {
  status?: EContentStatus
  search?: string
}

export interface ContentPayload {
  title: string
  description: string
  priceCents: number
  thumbnailKey: string | null
  videoKey: string | null
  durationSeconds?: number | null
  status: EContentStatus
  scheduledFor: string | null
}
