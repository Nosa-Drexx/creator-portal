import { ALL_PERMISSIONS, MANAGE_ALL, PERMISSION_GROUPS } from "@/constants/permissions"
import type { RoleSummary } from "@/types/members"

const LABELS = new Map(PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => [p.code as string, p.label])))

export const permissionLabel = (code: string) => LABELS.get(code) ?? code

export const isAllPermissions = (permissions: string[]) => permissions.includes(MANAGE_ALL)

/** MANAGE_ALL is shown and edited as the full explicit list */
export const expandPermissions = (permissions: string[]): string[] =>
  isAllPermissions(permissions) ? [...ALL_PERMISSIONS] : permissions

export function permissionSummary(permissions: string[]) {
  if (isAllPermissions(permissions)) return "All permissions"
  return `${permissions.length} of ${ALL_PERMISSIONS.length} permissions`
}

export const isBuiltIn = (role: Pick<RoleSummary, "systemKey">) => !!role.systemKey
