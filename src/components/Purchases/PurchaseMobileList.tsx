import { BuyerAvatar } from "@/components/shared/BuyerAvatar"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { PURCHASE_STATUS } from "@/constants/status"
import { EPurchaseStatus } from "@/enums/purchases"
import { countryFlag, countryName, formatPrice, formatRelativeDay } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Purchase } from "@/types/purchases"
import { DeletedTag, isVoided } from "./purchase-columns"

interface PurchaseMobileListProps {
  purchases: Purchase[]
  isFetching?: boolean
}

export function PurchaseMobileList({ purchases, isFetching }: PurchaseMobileListProps) {
  return (
    <ul className={cn("flex flex-col transition-opacity duration-300", isFetching && "opacity-50")}>
      {purchases.map((purchase, index) => {
        const status = PURCHASE_STATUS[purchase.status]
        return (
          <li
            key={purchase.id}
            className="flex animate-rise gap-3 border-b border-stroke/70 px-4 py-3.5 last:border-0"
            style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
          >
            <BuyerAvatar name={purchase.buyerName} className="mt-0.5 size-9" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-start justify-between gap-3">
                <span className="truncate text-[14px] font-semibold text-text-primary">{purchase.buyerName}</span>
                <span
                  className={cn(
                    "shrink-0 text-[14px] font-bold tabular",
                    isVoided(purchase.status) ? "text-text-tertiary line-through" : "text-text-primary",
                  )}
                >
                  {formatPrice(purchase.amountCents)}
                </span>
              </div>
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-[13px] text-text-secondary">{purchase.content.title}</span>
                {purchase.content.deleted && <DeletedTag />}
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <span className="truncate text-xs text-text-tertiary">
                  {formatRelativeDay(purchase.createdAt)} · {countryFlag(purchase.country)} {countryName(purchase.country)}
                </span>
                <StatusBadge
                  tone={status.tone}
                  label={status.label}
                  pulse={purchase.status === EPurchaseStatus.Pending}
                  className="h-5 px-2 text-[10.5px]"
                />
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
