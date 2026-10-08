"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Video01Icon } from "@hugeicons/core-free-icons"
import { Skeleton } from "@/components/ui/skeleton"
import { useSignedUrl } from "@/hooks/use-signed-url"
import type { Content } from "@/types/content"

/** Plays via a short-lived signed URL; the media route supports range requests for seeking */
export function VideoPlayer({ item }: { item: Content }) {
  const { signedUrl: src, isLoading } = useSignedUrl(item.videoKey)
  const { signedUrl: poster } = useSignedUrl(item.thumbnailKey)

  if (!item.videoKey) {
    return (
      <div className="grid aspect-video w-full place-items-center rounded-2xl bg-muted text-center text-text-tertiary">
        <div className="flex flex-col items-center gap-2">
          <HugeiconsIcon icon={Video01Icon} size={26} />
          <span className="text-sm">No video uploaded yet</span>
        </div>
      </div>
    )
  }

  if (isLoading || !src) return <Skeleton className="aspect-video w-full rounded-2xl" />

  return (
    <video
      key={src}
      src={src}
      poster={poster ?? undefined}
      controls
      playsInline
      preload="metadata"
      className="aspect-video w-full animate-rise rounded-2xl bg-black shadow-card"
    />
  )
}
