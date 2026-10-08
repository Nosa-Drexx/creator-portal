"use client"

import Link from "next/link"
import { ShoppingBag02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BuyerAvatar } from "@/components/shared/BuyerAvatar"
import { EmptyState } from "@/components/shared/EmptyState"
import { SectionCard } from "@/components/shared/SectionCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { routes } from "@/constants/routes"
import { PURCHASE_STATUS } from "@/constants/status"
import { usePurchases } from "@/hooks/queries/use-purchases"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { countryFlag, formatCurrency, formatTimeAgo } from "@/lib/format"

export function ContentBuyers({ contentId, title }: { contentId: string; title: string }) {
  const slug = useWorkspaceSlug()
  const { data, isPending } = usePurchases({ contentId, page: 1, limit: 5 })

  return (
    <SectionCard
      title="Latest buyers"
      actions={
        data && data.meta.total > 5 ? (
          <Button asChild variant="ghost" size="sm">
            <Link href={`${routes.purchases(slug)}?search=${encodeURIComponent(title)}`}>See all</Link>
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col p-2">
        {isPending ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="m-1 h-11 rounded-xl" />)
        ) : !data?.data.length ? (
          <EmptyState compact icon={ShoppingBag02Icon} title="No buyers yet" description="Sales of this video will show up here." />
        ) : (
          data.data.map((p) => {
            const status = PURCHASE_STATUS[p.status]
            return (
              <div key={p.id} className="flex items-center gap-3 rounded-xl p-2">
                <BuyerAvatar name={p.buyerName} className="size-7 text-[10px]" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[13px] font-semibold">
                    {p.buyerName} <span aria-hidden>{countryFlag(p.country)}</span>
                  </span>
                  <span className="text-[11.5px] text-text-tertiary">{formatTimeAgo(p.createdAt)}</span>
                </div>
                {p.status === "completed" ? (
                  <span className="text-[13px] font-bold tabular">{formatCurrency(p.amountCents)}</span>
                ) : (
                  <StatusBadge tone={status.tone} label={status.label} className="h-5 px-2 text-[10.5px]" />
                )}
              </div>
            )
          })
        )}
      </div>
    </SectionCard>
  )
}
