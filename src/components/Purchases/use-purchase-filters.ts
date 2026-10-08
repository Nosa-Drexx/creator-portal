"use client"

import { useCallback, useMemo } from "react"
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs"
import { EPurchaseSort, EPurchaseStatus } from "@/enums/purchases"
import type { PurchaseListParams } from "@/types/purchases"

export const PAGE_SIZE = 10

const parsers = {
  search: parseAsString.withDefault(""),
  status: parseAsStringEnum(Object.values(EPurchaseStatus)),
  sort: parseAsStringEnum(Object.values(EPurchaseSort)).withDefault(EPurchaseSort.Date),
  order: parseAsStringEnum(["asc", "desc"] as const).withDefault("desc"),
  page: parseAsInteger.withDefault(1),
}

export interface PurchaseFilterUpdate {
  search?: string | null
  status?: EPurchaseStatus | null
  sort?: EPurchaseSort | null
  order?: "asc" | "desc" | null
}

/** All list state lives in the URL so filtered views survive refresh and can be shared */
export function usePurchaseFilters() {
  const [filters, setFilters] = useQueryStates(parsers, { history: "replace", scroll: false })

  const params: PurchaseListParams = useMemo(
    () => ({
      search: filters.search || undefined,
      status: filters.status ?? undefined,
      sort: filters.sort,
      order: filters.order,
      page: filters.page,
      limit: PAGE_SIZE,
    }),
    [filters],
  )

  // Any filter change resets to page 1
  const update = useCallback(
    (next: PurchaseFilterUpdate) => setFilters({ ...next, page: null }),
    [setFilters],
  )

  const setPage = useCallback((page: number) => setFilters({ page }), [setFilters])
  const clear = useCallback(() => setFilters({ search: null, status: null, page: null }), [setFilters])
  const hasActiveFilters = !!filters.search || !!filters.status

  return { filters, params, update, setPage, clear, hasActiveFilters }
}
