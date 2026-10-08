import { formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"
import { S3Image } from "./S3Image"

interface ContentThumbnailProps {
  src: string | null
  title: string
  durationSeconds?: number | null
  className?: string
  sizes?: string
  zoomOnHover?: boolean
}

export function ContentThumbnail({ src, title, durationSeconds, className, sizes, zoomOnHover }: ContentThumbnailProps) {
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
