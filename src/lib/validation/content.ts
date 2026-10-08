import { z } from "zod"
import { EContentStatus } from "@/enums/content"

export const CONTENT_LIMITS = {
  titleMax: 120,
  descriptionMax: 2000,
  maxPriceCents: 100_000,
}

/** API contract for create/update; the form schema maps onto this */
export const contentPayloadSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(CONTENT_LIMITS.titleMax),
    description: z.string().trim().max(CONTENT_LIMITS.descriptionMax).default(""),
    priceCents: z.number().int().min(0).max(CONTENT_LIMITS.maxPriceCents),
    thumbnailKey: z.string().min(1).nullable(),
    videoKey: z.string().min(1).nullable(),
    durationSeconds: z.number().int().positive().max(86_400).nullable().optional(),
    status: z.enum(EContentStatus),
    scheduledFor: z.iso.datetime().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.status === EContentStatus.Draft) return
    if (!data.thumbnailKey) {
      ctx.addIssue({ code: "custom", path: ["thumbnailKey"], message: "A thumbnail is required to publish" })
    }
    if (!data.videoKey) {
      ctx.addIssue({ code: "custom", path: ["videoKey"], message: "A video is required to publish" })
    }
    if (data.status === EContentStatus.Scheduled) {
      if (!data.scheduledFor || new Date(data.scheduledFor).getTime() <= Date.now()) {
        ctx.addIssue({ code: "custom", path: ["scheduledFor"], message: "Pick a future date and time" })
      }
    }
  })

export type ContentPayloadInput = z.infer<typeof contentPayloadSchema>
