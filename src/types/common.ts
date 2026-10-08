import type { EErrorCode } from "@/enums/errors"

export interface IAPIError {
  code: EErrorCode
  message: string
  fieldErrors?: Record<string, string[]>
}

export type ApiResponse<T> = { success: true; data: T } | { success: false; error: IAPIError }

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
