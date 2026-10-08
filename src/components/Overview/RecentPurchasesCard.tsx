"use client"

import Link from "next/link"
import { ShoppingBag02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BuyerAvatar } from "@/components/shared/BuyerAvatar"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { SectionCard } from "@/components/shared/SectionCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { routes } from "@/constants/routes"
import { PURCHASE_STATUS } from "@/constants/status"
import { EPurchaseStatus } from "@/enums/purchases"
import { usePurchases } from "@/hooks/queries/use-purchases"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { countryFlag, formatCurrency, formatTimeAgo } from "@/lib/format"
import { cn } from "@/lib/utils"

export function RecentPurchasesCard() {
  const slug = useWorkspaceSlug()
  const { data, isPending, error, refetch, isRefetching } = usePurchases({ page: 1, limit: 6 })

  return (
    <SectionCard
      title="Recent purchases"
      description="Latest activity across your catalogue"
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link href={routes.purchases(slug)}>View all</Link>
        </Button>
      }
    >
      <div className="flex flex-col p-2 sm:p-3">
        {isPending ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="my-1 h-12 rounded-xl" />)
        ) : error ? (
          <ErrorState compact error={error} onRetry={refetch} isRetrying={isRefetching} />
        ) : data.data.length === 0 ? (
          <EmptyState
            compact
            icon={ShoppingBag02Icon}
            title="No purchases yet"
            description="When someone buys one of your videos, you'll see it here instantly."
          />
        ) : (
          data.data.map((purchase, index) => {
            const status = PURCHASE_STATUS[purchase.status]
            const muted = purchase.status !== EPurchaseStatus.Completed
            const voided = purchase.status === EPurchaseStatus.Refunded || purchase.status === EPurchaseStatus.Failed
            return (
              <div
                key={purchase.id}
                className="flex animate-rise items-center gap-3 rounded-xl p-2"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <BuyerAvatar name={purchase.buyerName} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[13.5px] font-semibold text-text-primary">
                    {purchase.buyerName} <span aria-hidden>{countryFlag(purchase.country)}</span>
                  </span>
                  <span className="truncate text-xs text-text-tertiary">{purchase.content.title}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn("text-[13.5px] font-bold tabular", voided && "text-text-tertiary line-through")}>
                    {formatCurrency(purchase.amountCents)}
                  </span>
                  {muted ? (
                    <StatusBadge tone={status.tone} label={status.label} className="h-5 px-2 text-[10.5px]" />
                  ) : (
                    <span className="text-[11px] text-text-tertiary">{formatTimeAgo(purchase.createdAt)}</span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </SectionCard>
  )
}
