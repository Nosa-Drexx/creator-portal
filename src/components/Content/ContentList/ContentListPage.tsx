"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Search01Icon, Video01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { DataTable, TableSkeleton } from "@/components/shared/DataTable"
import { DropdownSelect } from "@/components/shared/DropdownSelect"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { PageHeader } from "@/components/shared/PageHeader"
import { SearchInput } from "@/components/shared/SearchInput"
import { SegmentedControl } from "@/components/shared/SegmentedControl"
import { routes } from "@/constants/routes"
import { CanCreate } from "@/components/shared/Permissions"
import { EAction, EModule } from "@/constants/permissions"
import { usePermissions } from "@/hooks/use-permissions"
import { EContentStatus } from "@/enums/content"
import { useContentList } from "@/hooks/queries/use-content"
import { useIsMobile } from "@/hooks/use-mobile"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import type { Content } from "@/types/content"
import { buildContentColumns } from "./content-columns"
import { ContentMobileList } from "./ContentMobileList"
import { DeleteContentModal } from "./DeleteContentModal"
import { CONTENT_PAGE_SIZE, useContentFilters, type ContentSortKey } from "./use-content-filters"
import { CustomPagination } from "@/components/shared/CustomPagination"

const MOBILE_SORTS: { value: ContentSortKey; label: string }[] = [
  { value: "updated", label: "Recently edited" },
  { value: "revenue", label: "Top earning" },
  { value: "views", label: "Most viewed" },
  { value: "purchases", label: "Most purchased" },
]

export function ContentListPage() {
  const slug = useWorkspaceSlug()
  const router = useRouter()
  const isMobile = useIsMobile()
  const { data, isPending, error, refetch, isRefetching } = useContentList()
  const { filters, setFilters, visible, pageItems, page, totalPages, setPage, counts, sort, hasActiveFilters, clear } =
    useContentFilters(data)

  const changePage = (next: number) => {
    setPage(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const [toDelete, setToDelete] = useState<Content | null>(null)
  const { can } = usePermissions()
  const columns = buildContentColumns(setToDelete, can(EAction.View, EModule.Analytics))

  // No counts until the list loads, so a failure doesn't read as "0 videos"
  const count = (n: number) => (data ? n : undefined)
  const statusOptions = [
    { value: "all", label: "All", count: count(counts.all) },
    { value: EContentStatus.Published, label: "Published", count: count(counts.published) },
    { value: EContentStatus.Scheduled, label: "Scheduled", count: count(counts.scheduled) },
    { value: EContentStatus.Draft, label: "Drafts", count: count(counts.draft) },
  ]

  return (
    <>
      <PageHeader
        title="Content"
        description="Manage, publish and track every video in this workspace."
        actions={
          <CanCreate module={EModule.Content}>
            <Button asChild variant="brand" className="max-md:hidden">
              <Link href={routes.newContent(slug)}>
                <HugeiconsIcon icon={Add01Icon} size={16} />
                Upload video
              </Link>
            </Button>
          </CanCreate>
        }
      />

      <div className="flex animate-rise flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-hide md:mx-0 md:px-0">
          <SegmentedControl
            aria-label="Filter by status"
            value={filters.status ?? "all"}
            onChange={(v) => setFilters({ status: v === "all" ? null : (v as EContentStatus) })}
            options={statusOptions}
          />
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            value={filters.q}
            onChange={(q) => setFilters({ q: q || null })}
            placeholder="Search titles"
            className="flex-1 md:w-64"
          />
          {isMobile && (
            <DropdownSelect
              aria-label="Sort content"
              options={MOBILE_SORTS}
              value={filters.sort}
              onChange={(v) => setFilters({ sort: v, order: "desc" })}
              triggerClassName="w-[150px]"
            />
          )}
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl bg-surface shadow-card max-md:-mx-1">
        {isPending ? (
          <TableSkeleton columns={isMobile ? 2 : 6} rows={6} />
        ) : error ? (
          <ErrorState error={error} title="We couldn't load your content" onRetry={refetch} isRetrying={isRefetching} />
        ) : visible.length === 0 ? (
          hasActiveFilters ? (
            <EmptyState
              icon={Search01Icon}
              title="No videos match"
              description="Try a different search or status filter."
              action={<Button variant="outline" onClick={clear}>Clear filters</Button>}
            />
          ) : (
            <EmptyState
              icon={Video01Icon}
              title="Upload your first video"
              description="Add a title, price and your video file. You can publish now, schedule it, or keep it as a draft."
              action={
                <CanCreate module={EModule.Content}>
                  <Button asChild variant="brand">
                    <Link href={routes.newContent(slug)}>Upload video</Link>
                  </Button>
                </CanCreate>
              }
            />
          )
        ) : isMobile ? (
          <ContentMobileList items={pageItems} onDelete={setToDelete} />
        ) : (
          <DataTable
            columns={columns}
            data={pageItems}
            getRowId={(row) => row.id}
            sort={sort}
            onSortChange={(next) => setFilters({ sort: next.key as ContentSortKey, order: next.direction })}
            onRowClick={(row) => router.push(routes.contentDetail(slug, row.id))}
          />
        )}

        {visible.length > 0 && (
          <CustomPagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={visible.length}
            pageSize={CONTENT_PAGE_SIZE}
            onPageChange={changePage}
            className="border-t border-stroke px-4 py-3 sm:px-5"
          />
        )}
      </section>

      <DeleteContentModal item={toDelete} onClose={() => setToDelete(null)} />
    </>
  )
}
