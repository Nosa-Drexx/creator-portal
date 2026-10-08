"use client"

import { useWatch, type Control } from "react-hook-form"
import { BuyerPreviewCard } from "../BuyerPreviewCard"
import type { ContentFormValues } from "./schema"

/** Buyer preview that updates as the creator types */
export function LivePreview({ control }: { control: Control<ContentFormValues> }) {
  const [title, price, thumbnailKey, durationSeconds, status, videoKey] = useWatch({
    control,
    name: ["title", "price", "thumbnailKey", "durationSeconds", "status", "videoKey"],
  })
  return (
    <BuyerPreviewCard
      title={title}
      priceCents={price ? Math.round(Number(price) * 100) : null}
      thumbnailKey={thumbnailKey}
      durationSeconds={durationSeconds}
      status={status}
      hasVideo={!!videoKey}
    />
  )
}
