"use client"

import { useIsCompact } from "@/hooks/use-mobile"
import { CustomPagination } from "@/components/shared/CustomPagination"
import { DataTable, type DataTableSort } from "@/components/shared/DataTable"
import { ErrorState } from "@/components/shared/ErrorState"
import { PageHeader } from "@/components/shared/PageHeader"
import type { EPurchaseSort } from "@/enums/purchases"
import { usePurchases } from "@/hooks/queries/use-purchases"
import { formatNumber } from "@/lib/format"
import { purchaseColumns } from "./purchase-columns"
import { PurchaseMobileList } from "./PurchaseMobileList"
import { PurchasesEmpty } from "./PurchasesEmpty"
import { PurchaseListSkeleton } from "./PurchasesSkeleton"
import { PurchasesToolbar } from "./PurchasesToolbar"
import { PAGE_SIZE, usePurchaseFilters } from "./use-purchase-filters"

export function PurchasesPage() {
  const isCompact = useIsCompact()
  const { filters, params, update, setPage, clear, hasActiveFilters } = usePurchaseFilters()
  const { data, isPending, isPlaceholderData, error, refetch, isRefetching } = usePurchases(params)

  const total = data?.meta.total ?? 0
  const sort: DataTableSort = { key: filters.sort, direction: filters.order }

  const changePage = (page: number) => {
    setPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const summary = !data
    ? "Every sale across your catalogue."
    : hasActiveFilters
      ? `${formatNumber(total)} matching ${total === 1 ? "purchase" : "purchases"}`
      : `${formatNumber(total)} ${total === 1 ? "purchase" : "purchases"} across your catalogue, in every status`

  return (
    <>
      <PageHeader title="Purchases" description={summary} />
      <PurchasesToolbar filters={filters} update={update} />

      <section className="flex flex-col overflow-hidden rounded-2xl bg-surface shadow-card max-md:-mx-1">
        {isPending ? (
          <PurchaseListSkeleton />
        ) : error ? (
          <ErrorState error={error} title="We couldn't load purchases" onRetry={refetch} isRetrying={isRefetching} />
        ) : data.data.length === 0 ? (
          <PurchasesEmpty filtered={hasActiveFilters} onClear={clear} />
        ) : isCompact ? (
          <PurchaseMobileList purchases={data.data} isFetching={isPlaceholderData} />
        ) : (
          <DataTable
            columns={purchaseColumns}
            data={data.data}
            getRowId={(row) => row.id}
            sort={sort}
            onSortChange={(next) => update({ sort: next.key as EPurchaseSort, order: next.direction })}
            isFetching={isPlaceholderData}
          />
        )}

        {data && data.data.length > 0 && (
          <CustomPagination
            currentPage={data.meta.page}
            totalPages={data.meta.totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={changePage}
            className="border-t border-stroke px-4 py-3 sm:px-5"
          />
        )}
      </section>
    </>
  )
}
