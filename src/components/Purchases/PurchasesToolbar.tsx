"use client"

import { FilterHorizontalIcon, Sorting05Icon } from "@hugeicons/core-free-icons"
import { DropdownSelect } from "@/components/shared/DropdownSelect"
import { SearchInput } from "@/components/shared/SearchInput"
import { SegmentedControl } from "@/components/shared/SegmentedControl"
import { PURCHASE_STATUS } from "@/constants/status"
import { EPurchaseSort, EPurchaseStatus } from "@/enums/purchases"
import type { usePurchaseFilters } from "./use-purchase-filters"

type Filters = ReturnType<typeof usePurchaseFilters>
type StatusValue = EPurchaseStatus | "all"
type SortValue = `${EPurchaseSort}-${"asc" | "desc"}`

const STATUS_OPTIONS: { value: StatusValue; label: string }[] = [
  { value: "all", label: "All" },
  ...Object.values(EPurchaseStatus).map((value) => ({ value, label: PURCHASE_STATUS[value].label })),
]

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "date-desc", label: "Newest first" },
  { value: "date-asc", label: "Oldest first" },
  { value: "amount-desc", label: "Highest amount" },
  { value: "amount-asc", label: "Lowest amount" },
]

export function PurchasesToolbar({ filters, update }: Pick<Filters, "filters" | "update">) {
  const status: StatusValue = filters.status ?? "all"
  const setStatus = (value: StatusValue) => update({ status: value === "all" ? null : value })

  return (
    <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
      <SearchInput
        value={filters.search}
        onChange={(search) => update({ search: search || null })}
        placeholder="Search buyer, email, video or country"
        className="md:max-w-xs md:flex-1"
      />

      <SegmentedControl
        aria-label="Filter by status"
        value={status}
        onChange={setStatus}
        options={STATUS_OPTIONS}
        className="max-md:hidden"
      />

      <div className="grid grid-cols-2 gap-2 md:hidden">
        <DropdownSelect
          aria-label="Filter by status"
          leadingIcon={FilterHorizontalIcon}
          value={status}
          onChange={setStatus}
          options={STATUS_OPTIONS.map((o) => (o.value === "all" ? { ...o, label: "All statuses" } : o))}
          triggerClassName="w-full"
        />
        <DropdownSelect
          aria-label="Sort purchases"
          leadingIcon={Sorting05Icon}
          value={`${filters.sort}-${filters.order}` as SortValue}
          onChange={(value) => {
            const [sort, order] = value.split("-") as [EPurchaseSort, "asc" | "desc"]
            update({ sort, order })
          }}
          options={SORT_OPTIONS}
          triggerClassName="w-full"
        />
      </div>
    </div>
  )
}
