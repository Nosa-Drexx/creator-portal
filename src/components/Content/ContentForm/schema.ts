import { format } from "date-fns"
import { z } from "zod"
import { EContentStatus } from "@/enums/content"
import { CONTENT_LIMITS } from "@/lib/validation/content"
import type { Content, ContentPayload } from "@/types/content"

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/

export const contentFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Give your video a title of at least 3 characters")
      .max(CONTENT_LIMITS.titleMax, `Keep the title under ${CONTENT_LIMITS.titleMax} characters`),
    description: z
      .string()
      .max(CONTENT_LIMITS.descriptionMax, `Keep the description under ${CONTENT_LIMITS.descriptionMax} characters`),
    price: z
      .string()
      .trim()
      .min(1, "Set a price, or 0 for free")
      .regex(PRICE_PATTERN, "Use a number like 9.99")
      .refine((v) => Number(v) <= CONTENT_LIMITS.maxPriceCents / 100, "Price can't exceed $1,000"),
    thumbnailKey: z.string().nullable(),
    videoKey: z.string().nullable(),
    durationSeconds: z.number().nullable(),
    status: z.enum(EContentStatus),
    scheduledFor: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.status === EContentStatus.Draft) return
    if (!data.videoKey) ctx.addIssue({ code: "custom", path: ["videoKey"], message: "Upload a video before publishing" })
    if (!data.thumbnailKey) {
      ctx.addIssue({ code: "custom", path: ["thumbnailKey"], message: "Add a thumbnail before publishing" })
    }
    if (data.status === EContentStatus.Scheduled) {
      const when = new Date(data.scheduledFor)
      if (!data.scheduledFor || Number.isNaN(when.getTime()) || when <= new Date()) {
        ctx.addIssue({ code: "custom", path: ["scheduledFor"], message: "Choose a date and time in the future" })
      }
    }
  })

export type ContentFormValues = z.infer<typeof contentFormSchema>

export const EMPTY_CONTENT_FORM: ContentFormValues = {
  title: "",
  description: "",
  price: "",
  thumbnailKey: null,
  videoKey: null,
  durationSeconds: null,
  status: EContentStatus.Draft,
  scheduledFor: "",
}

const LOCAL_DATETIME = "yyyy-MM-dd'T'HH:mm"

export function toFormValues(content: Content): ContentFormValues {
  return {
    title: content.title,
    description: content.description,
    price: (content.priceCents / 100).toFixed(2),
    thumbnailKey: content.thumbnailKey,
    videoKey: content.videoKey,
    durationSeconds: content.durationSeconds,
    status: content.status,
    scheduledFor: content.scheduledFor ? format(new Date(content.scheduledFor), LOCAL_DATETIME) : "",
  }
}

export function toPayload(values: ContentFormValues, status = values.status): ContentPayload {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    priceCents: Math.round(Number(values.price || 0) * 100),
    thumbnailKey: values.thumbnailKey,
    videoKey: values.videoKey,
    durationSeconds: values.durationSeconds ? Math.round(values.durationSeconds) : null,
    status,
    scheduledFor:
      status === "scheduled" && values.scheduledFor ? new Date(values.scheduledFor).toISOString() : null,
  }
}

export const defaultScheduleTime = () => format(new Date(Date.now() + 24 * 3600 * 1000), "yyyy-MM-dd'T'09:00")
