import { ContentThumbnail } from "@/components/shared/ContentThumbnail"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { CONTENT_STATUS } from "@/constants/status"
import type { EContentStatus } from "@/enums/content"
import { formatPrice } from "@/lib/format"

interface BuyerPreviewCardProps {
  title: string
  /** null while the price hasn't been entered */
  priceCents: number | null
  thumbnailKey: string | null
  durationSeconds: number | null
  status: EContentStatus
  hasVideo?: boolean
}

/** How a video appears to buyers; shared by the content form and the detail page */
export function BuyerPreviewCard({ title, priceCents, thumbnailKey, durationSeconds, status, hasVideo }: BuyerPreviewCardProps) {
  const meta = CONTENT_STATUS[status]
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-semibold text-text-tertiary">Buyer preview</span>
      <div className="overflow-hidden rounded-xl border border-stroke bg-surface">
        <ContentThumbnail
          src={thumbnailKey}
          title={title || "Untitled video"}
          durationSeconds={durationSeconds ? Math.round(durationSeconds) : null}
          hasVideo={hasVideo}
          className="w-full rounded-none"
          sizes="320px"
        />
        <div className="flex flex-col gap-2 p-3">
          <p className="line-clamp-2 min-h-10 text-[13.5px] leading-snug font-semibold text-text-primary">
            {title || <span className="text-text-tertiary">Your title appears here</span>}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold tabular">{priceCents === null ? "—" : formatPrice(priceCents)}</span>
            <StatusBadge tone={meta.tone} label={meta.label} className="h-5 text-[10.5px]" />
          </div>
        </div>
      </div>
    </div>
  )
}
