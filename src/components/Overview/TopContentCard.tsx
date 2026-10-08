"use client"

import Link from "next/link"
import { Video01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ContentThumbnail } from "@/components/shared/ContentThumbnail"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { SectionCard } from "@/components/shared/SectionCard"
import { routes } from "@/constants/routes"
import { useContentList } from "@/hooks/queries/use-content"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { formatCompact, formatCurrency } from "@/lib/format"

export function TopContentCard() {
  const slug = useWorkspaceSlug()
  const { data, isPending, error, refetch, isRefetching } = useContentList()
  const top = (data ?? []).filter((c) => c.revenueCents > 0).sort((a, b) => b.revenueCents - a.revenueCents).slice(0, 5)
  const maxRevenue = top[0]?.revenueCents ?? 1

  return (
    <SectionCard
      title="Top performing"
      description="Ranked by lifetime revenue"
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link href={routes.content(slug)}>View all</Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-1 p-2 sm:p-3">
        {isPending ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)
        ) : error ? (
          <ErrorState compact error={error} onRetry={refetch} isRetrying={isRefetching} />
        ) : top.length === 0 ? (
          <EmptyState
            compact
            icon={Video01Icon}
            title="No earnings yet"
            description="Your best-selling videos will appear here after your first sale."
          />
        ) : (
          top.map((item, index) => (
            <Link
              key={item.id}
              href={routes.contentDetail(slug, item.id)}
              className="group flex animate-rise items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/70"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="w-4 text-center text-xs font-bold text-text-tertiary tabular">{index + 1}</span>
              <ContentThumbnail src={item.thumbnailKey} title={item.title} className="w-[72px]" sizes="72px" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="truncate text-[13.5px] font-semibold text-text-primary">{item.title}</span>
                <span className="relative h-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="absolute inset-y-0 left-0 origin-left animate-[grow_0.8s_var(--ease-out-soft)_both] rounded-full bg-brand"
                    style={{ width: `${(item.revenueCents / maxRevenue) * 100}%`, animationDelay: `${index * 60}ms` }}
                  />
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[13.5px] font-bold tabular">{formatCurrency(item.revenueCents, { whole: true })}</span>
                <span className="text-[11px] text-text-tertiary tabular">{formatCompact(item.purchases)} sales</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </SectionCard>
  )
}
