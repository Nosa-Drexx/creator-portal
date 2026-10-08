import { ContentThumbnail } from "@/components/shared/ContentThumbnail"
import type { DataTableColumn } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { CONTENT_STATUS } from "@/constants/status"
import { EContentStatus } from "@/enums/content"
import { formatCompact, formatCurrency, formatDate, formatPrice, formatTimeAgo } from "@/lib/format"
import type { Content } from "@/types/content"
import { ContentActionsMenu } from "./ContentActionsMenu"

const Muted = ({ children }: { children: React.ReactNode }) => <span className="text-text-tertiary">{children}</span>

export function statusCaption(item: Content) {
  if (item.status === EContentStatus.Scheduled && item.scheduledFor) return `Goes live ${formatDate(item.scheduledFor, "d MMM, HH:mm")}`
  if (item.status === EContentStatus.Published && item.publishedAt) return `Since ${formatDate(item.publishedAt)}`
  return `Edited ${formatTimeAgo(item.updatedAt)}`
}

export function buildContentColumns(onDelete: (item: Content) => void): DataTableColumn<Content>[] {
  return [
    {
      id: "title",
      header: "Video",
      cell: ({ row }) => (
        <div className="flex min-w-[260px] items-center gap-3">
          <ContentThumbnail
            src={row.original.thumbnailKey}
            title={row.original.title}
            durationSeconds={row.original.durationSeconds}
            className="w-[88px]"
            sizes="88px"
            zoomOnHover
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="line-clamp-2 font-semibold text-text-primary">{row.original.title}</span>
            <span className="text-xs text-text-tertiary">{statusCaption(row.original)}</span>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const meta = CONTENT_STATUS[row.original.status]
        return <StatusBadge tone={meta.tone} label={meta.label} />
      },
    },
    {
      id: "price",
      header: "Price",
      meta: { sortKey: "price", align: "right" },
      cell: ({ row }) => <span className="font-medium tabular">{formatPrice(row.original.priceCents)}</span>,
    },
    {
      id: "views",
      header: "Views",
      meta: { sortKey: "views", align: "right" },
      cell: ({ row }) =>
        row.original.views ? <span className="tabular">{formatCompact(row.original.views)}</span> : <Muted>—</Muted>,
    },
    {
      id: "purchases",
      header: "Purchases",
      meta: { sortKey: "purchases", align: "right" },
      cell: ({ row }) =>
        row.original.purchases ? <span className="tabular">{formatCompact(row.original.purchases)}</span> : <Muted>—</Muted>,
    },
    {
      id: "revenue",
      header: "Revenue",
      meta: { sortKey: "revenue", align: "right" },
      cell: ({ row }) =>
        row.original.revenueCents ? (
          <span className="font-semibold tabular">{formatCurrency(row.original.revenueCents, { whole: true })}</span>
        ) : (
          <Muted>—</Muted>
        ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      meta: { align: "right", cellClassName: "w-12" },
      cell: ({ row }) => <ContentActionsMenu item={row.original} onDelete={onDelete} />,
    },
  ]
}
