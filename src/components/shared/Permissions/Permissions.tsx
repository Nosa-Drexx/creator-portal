"use client"

import { EAction, EModule } from "@/constants/permissions"
import { usePermissions } from "@/hooks/use-permissions"
import { Skeleton } from "@/components/ui/skeleton"
import { AccessDenied } from "./AccessDenied"

interface GuardProps {
  module: EModule
  children?: React.ReactNode
  /** Rendered instead of nothing when access is missing */
  fallback?: React.ReactNode
}

function Guard({ module, action, children, fallback = null }: GuardProps & { action: EAction }) {
  const { can, loading } = usePermissions()
  if (loading) return null
  return <>{can(action, module) ? children : fallback}</>
}

export const CanRead = (props: GuardProps) => <Guard {...props} action={EAction.View} />
export const CanCreate = (props: GuardProps) => <Guard {...props} action={EAction.Create} />
export const CanUpdate = (props: GuardProps) => <Guard {...props} action={EAction.Edit} />
export const CanDelete = (props: GuardProps) => <Guard {...props} action={EAction.Delete} />
export const CanPublish = (props: GuardProps) => <Guard {...props} action={EAction.Publish} />
export const CanManage = (props: GuardProps) => <Guard {...props} action={EAction.Manage} />
export const CanTakeAction = (props: GuardProps & { action: EAction }) => <Guard {...props} />

interface RequirePermissionProps {
  module: EModule
  action?: EAction
  /** Grants access if the action is allowed on ANY of these modules */
  anyOf?: EModule[]
  fallback?: React.ReactNode
  children: React.ReactNode
}

/** Page-level guard: skeleton while loading, AccessDenied when not allowed */
export function RequirePermission({ module, action = EAction.View, anyOf, fallback, children }: RequirePermissionProps) {
  const { can, loading } = usePermissions()
  if (loading) return <>{fallback ?? <Skeleton className="h-80 rounded-2xl" />}</>
  const allowed = anyOf ? anyOf.some((m) => can(action, m)) : can(action, module)
  return <>{allowed ? children : <AccessDenied />}</>
}
