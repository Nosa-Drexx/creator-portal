import { z } from "zod"
import { EAnalyticsRange } from "@/enums/analytics"
import { EContentStatus } from "@/enums/content"
import { EPurchaseSort, EPurchaseStatus } from "@/enums/purchases"
import { EUploadKind } from "@/enums/uploads"

export const purchaseListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.enum(EPurchaseStatus).optional(),
  contentId: z.string().max(40).optional(),
  sort: z.enum(EPurchaseSort).default(EPurchaseSort.Date),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(5).max(100).default(10),
})

export const contentListQuerySchema = z.object({
  status: z.enum(EContentStatus).optional(),
  search: z.string().trim().max(100).optional(),
})

export const analyticsQuerySchema = z.object({
  range: z.enum(EAnalyticsRange).default(EAnalyticsRange.Month),
})

export const uploadIntentSchema = z.object({
  kind: z.enum(EUploadKind),
  fileName: z.string().trim().min(1).max(200),
  contentType: z.string().min(1).max(100),
  sizeBytes: z.number().int().positive(),
})
