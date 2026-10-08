import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, ArrowUp01Icon, ArrowUpDownIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { DataTableSort } from "./types"

interface SortableHeaderProps {
  label: React.ReactNode
  sortKey: string
  sort?: DataTableSort | null
  onSortChange?: (sort: DataTableSort) => void
  align?: "left" | "right"
}

export function SortableHeader({ label, sortKey, sort, onSortChange, align }: SortableHeaderProps) {
  const active = sort?.key === sortKey
  const icon = !active ? ArrowUpDownIcon : sort.direction === "asc" ? ArrowUp01Icon : ArrowDown01Icon
  const next: DataTableSort = {
    key: sortKey,
    direction: active && sort.direction === "desc" ? "asc" : "desc",
  }

  return (
    <button
      type="button"
      onClick={() => onSortChange?.(next)}
      aria-label={`Sort by ${typeof label === "string" ? label.toLowerCase() : sortKey}`}
      className={cn(
        "-mx-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1 transition-colors hover:bg-muted hover:text-text-primary focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
        active && "text-text-primary",
        align === "right" && "flex-row-reverse",
      )}
    >
      {label}
      <HugeiconsIcon icon={icon} size={13} className={cn(!active && "opacity-50")} />
    </button>
  )
}
