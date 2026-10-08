"use client"

import { useWatch, type Control } from "react-hook-form"
import { ContentThumbnail } from "@/components/shared/ContentThumbnail"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { CONTENT_STATUS } from "@/constants/status"
import { formatPrice } from "@/lib/format"
import type { ContentFormValues } from "./schema"

/** How the video will appear to buyers, updated as the creator types */
export function LivePreview({ control }: { control: Control<ContentFormValues> }) {
  const [title, price, thumbnailKey, durationSeconds, status] = useWatch({
    control,
    name: ["title", "price", "thumbnailKey", "durationSeconds", "status"],
  })
  const cents = Math.round(Number(price || 0) * 100)
  const meta = CONTENT_STATUS[status]

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-semibold text-text-tertiary">Buyer preview</span>
      <div className="overflow-hidden rounded-xl border border-stroke bg-surface">
        <ContentThumbnail
          src={thumbnailKey}
          title={title || "Untitled video"}
          durationSeconds={durationSeconds ? Math.round(durationSeconds) : null}
          className="w-full rounded-none"
          sizes="320px"
        />
        <div className="flex flex-col gap-2 p-3">
          <p className="line-clamp-2 min-h-10 text-[13.5px] leading-snug font-semibold text-text-primary">
            {title || <span className="text-text-tertiary">Your title appears here</span>}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold tabular">{price ? formatPrice(cents) : "—"}</span>
            <StatusBadge tone={meta.tone} label={meta.label} className="h-5 text-[10.5px]" />
          </div>
        </div>
      </div>
    </div>
  )
}
