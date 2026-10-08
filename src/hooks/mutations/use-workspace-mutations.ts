"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { SESSION_QUERY_KEY } from "@/hooks/queries/use-session"
import { customToast } from "@/hooks/use-toast"
import { getApiErrorMessage } from "@/lib/axios"
import { createWorkspace } from "@/services/api/session"

export function useCreateWorkspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: [...SESSION_QUERY_KEY] })
      customToast("success", `${workspace.name} is ready`)
    },
    onError: (error) => customToast("error", getApiErrorMessage(error, "We couldn't create that workspace.")),
  })
}
