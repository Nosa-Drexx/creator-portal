import { BuyerAvatar } from "@/components/shared/BuyerAvatar"
import { ContentThumbnail } from "@/components/shared/ContentThumbnail"
import type { DataTableColumn } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { PURCHASE_STATUS } from "@/constants/status"
import { EPurchaseSort, EPurchaseStatus } from "@/enums/purchases"
import { countryFlag, countryName, formatPrice, formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Purchase } from "@/types/purchases"

export const isVoided = (status: EPurchaseStatus) =>
  status === EPurchaseStatus.Refunded || status === EPurchaseStatus.Failed

export function DeletedTag() {
  return (
    <span className="shrink-0 rounded-[5px] bg-muted px-1.5 py-px text-[10px] font-semibold text-text-tertiary">
      Deleted
    </span>
  )
}

export const purchaseColumns: DataTableColumn<Purchase>[] = [
  {
    id: "buyer",
    header: "Buyer",
    cell: ({ row }) => (
      <div className="flex min-w-[180px] items-center gap-3">
        <BuyerAvatar name={row.original.buyerName} />
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-semibold text-text-primary">{row.original.buyerName}</span>
          <span className="truncate text-xs text-text-tertiary">{row.original.buyerEmail}</span>
        </div>
      </div>
    ),
  },
  {
    id: "content",
    header: "Content",
    cell: ({ row }) => {
      const { content } = row.original
      return (
        <div className="flex max-w-[280px] min-w-[200px] items-center gap-2.5">
          <ContentThumbnail src={content.thumbnailKey} title={content.title} className="w-14 rounded-md" sizes="56px" />
          <span className={cn("truncate text-[13px] font-medium", content.deleted ? "text-text-tertiary" : "text-text-primary")}>
            {content.title}
          </span>
          {content.deleted && <DeletedTag />}
        </div>
      )
    },
  },
  {
    id: "amount",
    header: "Amount",
    meta: { sortKey: EPurchaseSort.Amount, align: "right" },
    cell: ({ row }) => (
      <span
        className={cn(
          "font-semibold tabular",
          isVoided(row.original.status) ? "text-text-tertiary line-through" : "text-text-primary",
        )}
      >
        {formatPrice(row.original.amountCents)}
      </span>
    ),
  },
  {
    id: "country",
    header: "Country",
    cell: ({ row }) => (
      <span className="flex items-center gap-2 whitespace-nowrap text-text-secondary">
        <span className="text-base leading-none" aria-hidden>
          {countryFlag(row.original.country)}
        </span>
        {countryName(row.original.country)}
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = PURCHASE_STATUS[row.original.status]
      return <StatusBadge tone={status.tone} label={status.label} pulse={row.original.status === EPurchaseStatus.Pending} />
    },
  },
  {
    id: "date",
    header: "Date",
    meta: { sortKey: EPurchaseSort.Date, align: "right" },
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-text-secondary tabular">{formatDateTime(row.original.createdAt)}</span>
    ),
  },
]
