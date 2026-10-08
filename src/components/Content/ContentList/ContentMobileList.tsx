"use client"

import Link from "next/link"
import { ContentThumbnail } from "@/components/shared/ContentThumbnail"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { routes } from "@/constants/routes"
import { CONTENT_STATUS } from "@/constants/status"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { formatCompact, formatCurrency, formatPrice } from "@/lib/format"
import type { Content } from "@/types/content"
import { ContentActionsMenu } from "./ContentActionsMenu"
import { statusCaption } from "./content-columns"

interface ContentMobileListProps {
  items: Content[]
  onDelete: (item: Content) => void
}

export function ContentMobileList({ items, onDelete }: ContentMobileListProps) {
  const slug = useWorkspaceSlug()

  return (
    <ul className="flex flex-col divide-y divide-stroke">
      {items.map((item, index) => {
        const meta = CONTENT_STATUS[item.status]
        return (
          <li
            key={item.id}
            className="relative flex animate-rise gap-3 p-3"
            style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
          >
            <Link
              href={routes.contentDetail(slug, item.id)}
              className="absolute inset-0 z-0 active:bg-muted/60"
              aria-label={`Open ${item.title}`}
            />
            <ContentThumbnail
              src={item.thumbnailKey}
              title={item.title}
              durationSeconds={item.durationSeconds}
              hasVideo={!!item.videoKey}
              className="pointer-events-none w-[112px]"
              sizes="112px"
            />
            <div className="pointer-events-none flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-start gap-1">
                <span className="line-clamp-2 flex-1 text-[14px] leading-snug font-semibold">{item.title}</span>
                <div className="pointer-events-auto relative z-10 -mt-1 -mr-1">
                  <ContentActionsMenu item={item} onDelete={onDelete} />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <StatusBadge tone={meta.tone} label={meta.label} className="h-5 px-2 text-[10.5px]" />
                <span className="text-[11.5px] text-text-tertiary">{statusCaption(item)}</span>
              </div>
              <div className="mt-auto flex items-center gap-3 text-xs text-text-secondary tabular">
                <span className="font-semibold text-text-primary">{formatPrice(item.priceCents)}</span>
                {!!item.views && <span>{formatCompact(item.views)} views</span>}
                {!!item.revenueCents && <span>{formatCurrency(item.revenueCents, { whole: true })} earned</span>}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
