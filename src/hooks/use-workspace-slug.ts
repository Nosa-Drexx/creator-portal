"use client"

import { useParams } from "next/navigation"

export function useWorkspaceSlug() {
  const { workspace } = useParams<{ workspace: string }>()
  return workspace
}
