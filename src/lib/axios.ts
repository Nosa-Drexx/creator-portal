import axios, { type AxiosError } from "axios"
import { EErrorCode } from "@/enums/errors"
import type { IAPIError } from "@/types/common"

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
})

/** Unwraps the `{ success, data }` envelope every route returns */
export interface Envelope<T> {
  success: true
  data: T
}

type ErrorEnvelope = { error?: IAPIError }

export function getApiError(error: unknown): IAPIError | null {
  if (!axios.isAxiosError(error)) return null
  const apiError = (error as AxiosError<ErrorEnvelope>).response?.data?.error
  if (apiError?.code) return apiError
  if (error.code === "ECONNABORTED") {
    return { code: EErrorCode.Internal, message: "The request timed out. Check your connection and try again." }
  }
  if (!error.response) {
    return { code: EErrorCode.Internal, message: "You appear to be offline. Check your connection and try again." }
  }
  return null
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  return getApiError(error)?.message ?? fallback
}

export function isApiErrorCode(error: unknown, code: EErrorCode) {
  return getApiError(error)?.code === code
}
