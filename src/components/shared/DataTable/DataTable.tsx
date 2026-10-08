"use client"

import { useTable, type RowData } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { SortableHeader } from "./SortableHeader"
import { dataTableFeatures, type DataTableColumn, type DataTableSort } from "./types"

interface DataTableProps<TData extends RowData> {
  columns: DataTableColumn<TData>[]
  data: TData[]
  getRowId: (row: TData) => string
  /** Controlled server-side sort */
  sort?: DataTableSort | null
  onSortChange?: (sort: DataTableSort) => void
  onRowClick?: (row: TData) => void
  /** Dims rows while a new page/filter is loading */
  isFetching?: boolean
  className?: string
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  sort,
  onSortChange,
  onRowClick,
  isFetching,
  className,
}: DataTableProps<TData>) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId: (row) => getRowId(row),
  })

  return (
    <div className={cn("overflow-x-auto scrollbar-hide", className)}>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id} className="border-b border-stroke">
              {group.headers.map((header) => {
                const meta = header.column.columnDef.meta
                const content = header.isPlaceholder ? null : <table.FlexRender header={header} />
                return (
                  <th
                    key={header.id}
                    scope="col"
                    aria-sort={
                      meta?.sortKey && sort?.key === meta.sortKey
                        ? sort.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                    className={cn(
                      "h-10 px-3 text-xs font-semibold whitespace-nowrap text-text-tertiary first:pl-5 last:pr-5",
                      meta?.align === "right" && "text-right",
                      meta?.headerClassName,
                    )}
                  >
                    {meta?.sortKey ? (
                      <SortableHeader
                        label={content}
                        sortKey={meta.sortKey}
                        sort={sort}
                        onSortChange={onSortChange}
                        align={meta.align}
                      />
                    ) : (
                      content
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody className={cn("transition-opacity duration-300", isFetching && "opacity-50")}>
          {table.getRowModel().rows.map((row, index) => (
            <tr
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              className={cn(
                "animate-rise border-b border-stroke/70 transition-colors last:border-0 hover:bg-muted/50",
                onRowClick && "cursor-pointer",
              )}
              style={{ animationDelay: `${Math.min(index, 10) * 25}ms` }}
            >
              {row.getAllCells().map((cell) => {
                const meta = cell.column.columnDef.meta
                return (
                  <td
                    key={cell.id}
                    className={cn(
                      "h-[60px] px-3 align-middle first:pl-5 last:pr-5",
                      meta?.align === "right" && "text-right",
                      meta?.cellClassName,
                    )}
                  >
                    <table.FlexRender cell={cell} />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
