"use client"

import { useMemo } from "react"
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs"
import type { DataTableSort } from "@/components/shared/DataTable"
import { EContentStatus } from "@/enums/content"
import type { Content } from "@/types/content"

export type ContentSortKey = "updated" | "revenue" | "views" | "purchases" | "price"

const parsers = {
  q: parseAsString.withDefault(""),
  status: parseAsStringEnum(Object.values(EContentStatus)),
  sort: parseAsStringEnum<ContentSortKey>(["updated", "revenue", "views", "purchases", "price"]).withDefault("updated"),
  order: parseAsStringEnum(["asc", "desc"] as const).withDefault("desc"),
  page: parseAsInteger.withDefault(1),
}

export const CONTENT_PAGE_SIZE = 10

const SORTERS: Record<ContentSortKey, (c: Content) => number> = {
  updated: (c) => new Date(c.updatedAt).getTime(),
  revenue: (c) => c.revenueCents ?? 0,
  views: (c) => c.views ?? 0,
  purchases: (c) => c.purchases ?? 0,
  price: (c) => c.priceCents,
}

/** The catalogue is small per creator, so filtering and sorting run client-side for instant feedback */
export function useContentFilters(items: Content[] | undefined) {
  const [filters, setQuery] = useQueryStates(parsers, { history: "replace", scroll: false })

  // Any filter or sort change starts again from page 1
  const setFilters = (next: Omit<Parameters<typeof setQuery>[0], "page">) => setQuery({ ...next, page: null })
  const setPage = (page: number) => setQuery({ page })

  const counts = useMemo(() => {
    const all = items ?? []
    return {
      all: all.length,
      [EContentStatus.Published]: all.filter((c) => c.status === EContentStatus.Published).length,
      [EContentStatus.Scheduled]: all.filter((c) => c.status === EContentStatus.Scheduled).length,
      [EContentStatus.Draft]: all.filter((c) => c.status === EContentStatus.Draft).length,
    }
  }, [items])

  const visible = useMemo(() => {
    const term = filters.q.trim().toLowerCase()
    const pick = SORTERS[filters.sort]
    const dir = filters.order === "asc" ? 1 : -1
    return (items ?? [])
      .filter((c) => !filters.status || c.status === filters.status)
      .filter((c) => !term || c.title.toLowerCase().includes(term))
      .sort((a, b) => (pick(a) - pick(b)) * dir)
  }, [items, filters])

  const totalPages = Math.max(1, Math.ceil(visible.length / CONTENT_PAGE_SIZE))
  const page = Math.min(filters.page, totalPages)
  const pageItems = visible.slice((page - 1) * CONTENT_PAGE_SIZE, page * CONTENT_PAGE_SIZE)
  const sort: DataTableSort = { key: filters.sort, direction: filters.order }

  return {
    filters,
    setFilters,
    visible,
    pageItems,
    page,
    totalPages,
    setPage,
    counts,
    sort,
    hasActiveFilters: !!filters.q || !!filters.status,
    clear: () => setFilters({ q: null, status: null }),
  }
}
