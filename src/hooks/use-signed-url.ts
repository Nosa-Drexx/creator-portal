"use client"

import { useQuery } from "@tanstack/react-query"
import { isPublicPath } from "@/lib/media"
import { signMediaKeys } from "@/services/api/uploads"
import { useWorkspaceSlug } from "./use-workspace-slug"

/** Refresh comfortably before the 10 minute signed URL expiry */
const STALE_MS = 8 * 60 * 1000

/** Resolves a storage key to a short-lived signed URL; public paths and blob: previews pass through */
export function useSignedUrl(keyOrUrl: string | null | undefined) {
  const slug = useWorkspaceSlug()
  const passthrough = !!keyOrUrl && isPublicPath(keyOrUrl)

  const query = useQuery({
    queryKey: ["signed-url", slug, keyOrUrl],
    queryFn: async () => (await signMediaKeys(slug, [keyOrUrl!])).urls[keyOrUrl!],
    enabled: !!keyOrUrl && !passthrough && !!slug,
    staleTime: STALE_MS,
    gcTime: STALE_MS + 60_000,
    retry: 1,
  })

  if (passthrough) return { signedUrl: keyOrUrl, isLoading: false, isError: false }
  return { signedUrl: query.data ?? null, isLoading: !!keyOrUrl && query.isPending, isError: query.isError }
}
