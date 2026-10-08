"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { EErrorCode } from "@/enums/errors"
import { ANALYTICS_QUERY_KEY } from "@/hooks/queries/use-analytics"
import { CONTENT_QUERY_KEY } from "@/hooks/queries/use-content"
import { customToast } from "@/hooks/use-toast"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { getApiErrorMessage, isApiErrorCode } from "@/lib/axios"
import { createContent, deleteContent, updateContent } from "@/services/api/content"
import type { Content, ContentPayload } from "@/types/content"

function useInvalidateContent() {
  const queryClient = useQueryClient()
  const slug = useWorkspaceSlug()
  return () => {
    queryClient.invalidateQueries({ queryKey: [...CONTENT_QUERY_KEY, slug] })
    queryClient.invalidateQueries({ queryKey: [...ANALYTICS_QUERY_KEY, slug] })
  }
}

/** The publish gate is handled by the form (it opens the verify prompt), so no toast for it */
function toastUnlessVerification(error: unknown, fallback: string) {
  if (isApiErrorCode(error, EErrorCode.VerificationRequired)) return
  customToast("error", getApiErrorMessage(error, fallback))
}

export function useSaveContent(id?: string) {
  const slug = useWorkspaceSlug()
  const invalidate = useInvalidateContent()
  return useMutation({
    mutationFn: (payload: ContentPayload) =>
      id ? updateContent(slug, id, payload) : createContent(slug, payload),
    onSuccess: () => invalidate(),
    onError: (error) => toastUnlessVerification(error, "We couldn't save your content. Please try again."),
  })
}

export function useDeleteContent() {
  const slug = useWorkspaceSlug()
  const queryClient = useQueryClient()
  const invalidate = useInvalidateContent()
  return useMutation({
    mutationFn: (item: Pick<Content, "id" | "title">) => deleteContent(slug, item.id),
    onSuccess: (_, item) => {
      queryClient.setQueriesData<Content[]>({ queryKey: [...CONTENT_QUERY_KEY, slug, "list"] }, (prev) =>
        prev?.filter((c) => c.id !== item.id),
      )
      invalidate()
      customToast("success", `“${item.title}” was deleted.`)
    },
    onError: (error) => customToast("error", getApiErrorMessage(error, "We couldn't delete that. Please try again.")),
  })
}
