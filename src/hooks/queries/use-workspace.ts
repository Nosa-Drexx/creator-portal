"use client"

import { useQuery } from "@tanstack/react-query"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { fetchWorkspace } from "@/services/api/session"

export const WORKSPACE_QUERY_KEY = ["workspace"] as const

export function useWorkspace() {
  const slug = useWorkspaceSlug()
  return useQuery({
    queryKey: [...WORKSPACE_QUERY_KEY, slug],
    queryFn: () => fetchWorkspace(slug),
    enabled: !!slug,
    staleTime: 30_000,
  })
}
