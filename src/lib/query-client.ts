import { QueryClient } from "@tanstack/react-query"
import axios from "axios"

const NO_RETRY_STATUSES = [400, 401, 403, 404, 409, 422]

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 20_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const status = axios.isAxiosError(error) ? error.response?.status : undefined
          if (status && NO_RETRY_STATUSES.includes(status)) return false
          return failureCount < 2
        },
      },
    },
  })
}
