import { tableFeatures, type ColumnDef, type RowData } from "@tanstack/react-table"

export interface DataTableColumnMeta {
  /** Server sort key; makes the header clickable */
  sortKey?: string
  headerClassName?: string
  cellClassName?: string
  align?: "left" | "right"
}

export const dataTableFeatures = tableFeatures({ columnMeta: {} as DataTableColumnMeta })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataTableColumn<TData extends RowData> = ColumnDef<typeof dataTableFeatures, TData, any>

export interface DataTableSort {
  key: string
  direction: "asc" | "desc"
}
