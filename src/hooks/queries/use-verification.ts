"use client"

import { useQuery } from "@tanstack/react-query"
import { EVerificationStatus } from "@/enums/verification"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { fetchVerification } from "@/services/api/verification"

export const VERIFICATION_QUERY_KEY = ["verification"] as const

export function useVerification() {
  const slug = useWorkspaceSlug()
  return useQuery({
    queryKey: [...VERIFICATION_QUERY_KEY, slug],
    queryFn: () => fetchVerification(slug),
    // Poll while a review is in flight so approval shows up without a refresh
    refetchInterval: (query) => (query.state.data?.status === EVerificationStatus.Pending ? 5_000 : false),
  })
}
