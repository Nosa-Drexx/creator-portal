"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, PencilEdit02Icon, Video01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { BackLink } from "@/components/shared/BackLink"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { Reveal } from "@/components/shared/motion/Reveal"
import { SectionCard } from "@/components/shared/SectionCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { routes } from "@/constants/routes"
import { CONTENT_STATUS } from "@/constants/status"
import { EContentStatus } from "@/enums/content"
import { EErrorCode } from "@/enums/errors"
import { useContentItem } from "@/hooks/queries/use-content"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { isApiErrorCode } from "@/lib/axios"
import { formatBytes, formatDateTime, formatDuration, formatPrice } from "@/lib/format"
import { DeleteContentModal } from "../ContentList/DeleteContentModal"
import { ContentDetailSkeleton } from "./ContentDetailSkeleton"
import { ContentBuyers } from "./ContentBuyers"
import { ContentStats } from "./ContentStats"
import { VideoPlayer } from "./VideoPlayer"

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-[13px]">
      <dt className="text-text-tertiary">{label}</dt>
      <dd className="truncate text-right font-medium text-text-primary">{value}</dd>
    </div>
  )
}

export function ContentDetailPage() {
  const slug = useWorkspaceSlug()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { data: item, isPending, error, refetch, isRefetching } = useContentItem(id)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (isPending) return <ContentDetailSkeleton />
  if (isApiErrorCode(error, EErrorCode.NotFound)) {
    return (
      <EmptyState
        icon={Video01Icon}
        title="This video doesn't exist"
        description="It may have been deleted, or it belongs to another workspace."
        action={<BackLink href={routes.content(slug)} label="Back to content" />}
      />
    )
  }
  if (error || !item) return <ErrorState error={error} onRetry={refetch} isRetrying={isRefetching} />

  const status = CONTENT_STATUS[item.status]

  return (
    <>
      <div className="flex flex-col gap-3">
        <BackLink href={routes.content(slug)} label="Content" />
        <div className="flex animate-rise flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex items-center gap-2">
              <StatusBadge tone={status.tone} label={status.label} />
              <span className="text-sm font-bold tabular">{formatPrice(item.priceCents)}</span>
            </div>
            <h1 className="text-[24px] leading-tight font-bold sm:text-[28px]">{item.title}</h1>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button asChild variant="outline" className="max-sm:flex-1">
              <Link href={routes.editContent(slug, item.id)}>
                <HugeiconsIcon icon={PencilEdit02Icon} size={16} />
                Edit
              </Link>
            </Button>
            <Button variant="destructive" onClick={() => setConfirmDelete(true)} className="max-sm:flex-1">
              <HugeiconsIcon icon={Delete02Icon} size={16} />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
        <Reveal className="flex min-w-0 flex-col gap-5">
          <VideoPlayer item={item} />
          <ContentStats item={item} />
          <SectionCard title="Description" bodyClassName="p-4 pt-2 sm:p-5 sm:pt-2">
            <p className="text-sm leading-relaxed whitespace-pre-line text-text-secondary">
              {item.description || "No description yet. Buyers convert better when they know what they're getting."}
            </p>
          </SectionCard>
        </Reveal>

        <Reveal delay={0.08} className="flex flex-col gap-5">
          <SectionCard title="Details" bodyClassName="px-4 pb-2 sm:px-5">
            <dl className="divide-y divide-stroke">
              <MetaRow label="Duration" value={formatDuration(item.durationSeconds)} />
              <MetaRow label="File" value={item.videoFileName ?? "—"} />
              <MetaRow label="Size" value={formatBytes(item.videoSizeBytes)} />
              {item.status === EContentStatus.Scheduled && item.scheduledFor && (
                <MetaRow label="Goes live" value={formatDateTime(item.scheduledFor)} />
              )}
              {item.publishedAt && <MetaRow label="Published" value={formatDateTime(item.publishedAt)} />}
              <MetaRow label="Last edited" value={formatDateTime(item.updatedAt)} />
            </dl>
          </SectionCard>
          <ContentBuyers contentId={item.id} title={item.title} />
        </Reveal>
      </div>

      <DeleteContentModal
        item={confirmDelete ? item : null}
        onClose={() => setConfirmDelete(false)}
        onDeleted={() => router.replace(routes.content(slug))}
      />
    </>
  )
}
