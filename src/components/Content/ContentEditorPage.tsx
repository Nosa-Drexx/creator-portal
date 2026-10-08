"use client"

import { Video01Icon } from "@hugeicons/core-free-icons"
import { useParams } from "next/navigation"
import { BackLink } from "@/components/shared/BackLink"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { PageHeader } from "@/components/shared/PageHeader"
import { routes } from "@/constants/routes"
import { EErrorCode } from "@/enums/errors"
import { useContentItem } from "@/hooks/queries/use-content"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { isApiErrorCode } from "@/lib/axios"
import { ContentForm } from "./ContentForm/ContentForm"
import { EMPTY_CONTENT_FORM, toFormValues } from "./ContentForm/schema"
import { ContentEditorSkeleton } from "./ContentEditorSkeleton"

export function NewContentPage() {
  const slug = useWorkspaceSlug()
  return (
    <>
      <div className="flex flex-col gap-3">
        <BackLink href={routes.content(slug)} label="Content" />
        <PageHeader title="Upload a video" description="Add the details, upload your media, then choose when it goes live." />
      </div>
      <ContentForm defaults={EMPTY_CONTENT_FORM} />
    </>
  )
}

export function EditContentPage() {
  const slug = useWorkspaceSlug()
  const { id } = useParams<{ id: string }>()
  const { data, isPending, error, refetch, isRefetching } = useContentItem(id)

  if (isPending) return <ContentEditorSkeleton />
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
  if (error || !data) return <ErrorState error={error} onRetry={refetch} isRetrying={isRefetching} />

  return (
    <>
      <div className="flex flex-col gap-3">
        <BackLink href={routes.contentDetail(slug, data.id)} label="Back to video" />
        <PageHeader title="Edit video" description={data.title} />
      </div>
      {/* Keyed so switching between videos never reuses stale form state */}
      <ContentForm key={data.id} defaults={toFormValues(data)} existing={data} />
    </>
  )
}

