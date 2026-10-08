import { EAction, EModule, MANAGE_ALL, perm, type Permission } from "@/constants/permissions"

export const hasPermission = (permissions: readonly string[], code: Permission) =>
  permissions.includes(MANAGE_ALL) || permissions.includes(code)

/** "Read" is satisfied by view or manage on the module */
export const canRead = (permissions: readonly string[], module: EModule) =>
  hasPermission(permissions, perm(EAction.View, module)) || hasPermission(permissions, perm(EAction.Manage, module))

export const canCreate = (p: readonly string[], module: EModule) => hasPermission(p, perm(EAction.Create, module))
export const canUpdate = (p: readonly string[], module: EModule) => hasPermission(p, perm(EAction.Edit, module))
export const canDelete = (p: readonly string[], module: EModule) => hasPermission(p, perm(EAction.Delete, module))
export const canPublish = (p: readonly string[], module: EModule) => hasPermission(p, perm(EAction.Publish, module))
export const canManage = (p: readonly string[], module: EModule) => hasPermission(p, perm(EAction.Manage, module))

export const canTakeAction = (permissions: readonly string[], module: EModule, action: EAction) =>
  action === EAction.View ? canRead(permissions, module) : hasPermission(permissions, perm(action, module))
