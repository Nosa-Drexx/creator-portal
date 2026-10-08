"use client"

import { useCallback, useMemo } from "react"
import { canTakeAction, hasPermission } from "@/components/shared/Permissions/Permissions.utils"
import type { EAction, EModule, Permission } from "@/constants/permissions"
import { useWorkspace } from "@/hooks/queries/use-workspace"

/**
 * Permissions for the current workspace. The workspace query is the single
 * source of truth, so a role change shows up everywhere after one refetch.
 */
export function usePermissions() {
  const { data, isPending } = useWorkspace()
  const permissions = useMemo(() => data?.permissions ?? [], [data?.permissions])

  const can = useCallback(
    (action: EAction, module: EModule) => canTakeAction(permissions, module, action),
    [permissions],
  )
  const has = useCallback((code: Permission) => hasPermission(permissions, code), [permissions])

  return { permissions, role: data?.role, loading: isPending, can, has }
}
