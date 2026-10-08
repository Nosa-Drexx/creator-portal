"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { SESSION_QUERY_KEY } from "@/hooks/queries/use-session"
import { VERIFICATION_QUERY_KEY } from "@/hooks/queries/use-verification"
import { WORKSPACE_QUERY_KEY } from "@/hooks/queries/use-workspace"
import { customToast } from "@/hooks/use-toast"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { getApiErrorMessage } from "@/lib/axios"
import { submitVerification } from "@/services/api/verification"
import type { VerificationPayload } from "@/types/verification"

export function useSubmitVerification() {
  const slug = useWorkspaceSlug()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: VerificationPayload) => submitVerification(slug, payload),
    onSuccess: (data) => {
      queryClient.setQueryData([...VERIFICATION_QUERY_KEY, slug], data)
      queryClient.invalidateQueries({ queryKey: [...WORKSPACE_QUERY_KEY, slug] })
      queryClient.invalidateQueries({ queryKey: [...SESSION_QUERY_KEY] })
    },
    onError: (error) =>
      customToast("error", getApiErrorMessage(error, "We couldn't submit your verification. Please try again.")),
  })
}
