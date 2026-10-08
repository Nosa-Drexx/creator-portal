"use client"

import { useMemo } from "react"
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs"
import type { DataTableSort } from "@/components/shared/DataTable"
import { EContentStatus } from "@/enums/content"
import type { Content } from "@/types/content"

export type ContentSortKey = "updated" | "revenue" | "views" | "purchases" | "price"

const parsers = {
  q: parseAsString.withDefault(""),
  status: parseAsStringEnum(Object.values(EContentStatus)),
  sort: parseAsStringEnum<ContentSortKey>(["updated", "revenue", "views", "purchases", "price"]).withDefault("updated"),
  order: parseAsStringEnum(["asc", "desc"] as const).withDefault("desc"),
}

const SORTERS: Record<ContentSortKey, (c: Content) => number> = {
  updated: (c) => new Date(c.updatedAt).getTime(),
  revenue: (c) => c.revenueCents,
  views: (c) => c.views,
  purchases: (c) => c.purchases,
  price: (c) => c.priceCents,
}

/** The catalogue is small per creator, so filtering and sorting run client-side for instant feedback */
export function useContentFilters(items: Content[] | undefined) {
  const [filters, setFilters] = useQueryStates(parsers, { history: "replace", scroll: false })

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

  const sort: DataTableSort = { key: filters.sort, direction: filters.order }

  return {
    filters,
    setFilters,
    visible,
    counts,
    sort,
    hasActiveFilters: !!filters.q || !!filters.status,
    clear: () => setFilters({ q: null, status: null }),
  }
}
