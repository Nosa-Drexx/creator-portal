import { HugeiconsIcon } from "@hugeicons/react"
import { VideoOffIcon } from "@hugeicons/core-free-icons"
import { formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"
import { S3Image } from "./S3Image"

interface ContentThumbnailProps {
  src: string | null
  title: string
  durationSeconds?: number | null
  /** When false, shows a "no video yet" tile instead of the thumbnail */
  hasVideo?: boolean
  className?: string
  sizes?: string
  zoomOnHover?: boolean
}

export function ContentThumbnail({
  src,
  title,
  durationSeconds,
  hasVideo = true,
  className,
  sizes,
  zoomOnHover,
}: ContentThumbnailProps) {
  if (!hasVideo) {
    return (
      <div
        className={cn(
          "flex aspect-video shrink-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-lg border border-dashed border-stroke-strong bg-muted text-text-tertiary",
          className,
        )}
        role="img"
        aria-label={`${title}: no video uploaded yet`}
      >
        <HugeiconsIcon icon={VideoOffIcon} size={16} />
        <span className="text-[10px] leading-none font-semibold whitespace-nowrap">No video yet</span>
      </div>
    )
  }

  return (
    <div className={cn("relative aspect-video shrink-0 overflow-hidden rounded-lg", className)}>
      <S3Image src={src} alt={title} sizes={sizes} zoomOnHover={zoomOnHover} containerClassName="absolute inset-0" />
      {!!durationSeconds && (
        <span className="absolute right-1 bottom-1 rounded-[5px] bg-black/70 px-1 py-px text-[10px] font-semibold text-white tabular backdrop-blur-sm">
          {formatDuration(durationSeconds)}
        </span>
      )}
    </div>
  )
}
