"use client"

import { useQuery } from "@tanstack/react-query"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { fetchContent, fetchContentList } from "@/services/api/content"
import type { ContentListParams } from "@/types/content"

export const CONTENT_QUERY_KEY = ["content"] as const

export function useContentList(params: ContentListParams = {}) {
  const slug = useWorkspaceSlug()
  return useQuery({
    queryKey: [...CONTENT_QUERY_KEY, slug, "list", params],
    queryFn: () => fetchContentList(slug, params),
  })
}

export function useContentItem(id: string | undefined) {
  const slug = useWorkspaceSlug()
  return useQuery({
    queryKey: [...CONTENT_QUERY_KEY, slug, "detail", id],
    queryFn: () => fetchContent(slug, id!),
    enabled: !!id,
  })
}
