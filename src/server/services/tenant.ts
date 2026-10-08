import "server-only"

import { and, eq } from "drizzle-orm"
import { EVerificationStatus } from "@/enums/verification"
import { db } from "@/server/db/client"
import { memberships, roles, workspaces, type RoleRow, type UserRow, type WorkspaceRow } from "@/server/db/schema"
import { Errors } from "@/server/lib/errors"
import { requireUser } from "@/server/lib/session"
import type { Workspace } from "@/types/workspace"
import { hasPermission } from "./permissions"
import { canPublish } from "./publishing"
import { getVerification } from "./verification"

export interface TenantContext {
  user: UserRow
  workspace: WorkspaceRow
  role: RoleRow
  permissions: string[]
  verificationStatus: EVerificationStatus
}

/**
 * Every workspace-scoped request goes through here. Non-members get a 404
 * rather than a 403 so workspace slugs can't be probed.
 */
export async function requireTenant(slug: string): Promise<TenantContext> {
  const user = await requireUser()
  const [match] = await db
    .select({ workspace: workspaces, role: roles })
    .from(workspaces)
    .innerJoin(memberships, and(eq(memberships.workspaceId, workspaces.id), eq(memberships.userId, user.id)))
    .innerJoin(roles, eq(roles.id, memberships.roleId))
    .where(eq(workspaces.slug, slug))
    .limit(1)

  if (!match) throw Errors.notFound("Workspace")

  const verification = await getVerification(match.workspace.id)
  return {
    user,
    workspace: match.workspace,
    role: match.role,
    permissions: match.role.permissions,
    verificationStatus: verification.status as EVerificationStatus,
  }
}

export function toWorkspaceDto(ctx: Omit<TenantContext, "user">): Workspace {
  const { workspace, role } = ctx
  return {
    id: workspace.id,
    slug: workspace.slug,
    name: workspace.name,
    handle: workspace.handle,
    accentColor: workspace.accentColor,
    avatarUrl: workspace.avatarUrl,
    role: { id: role.id, name: role.name, systemKey: role.systemKey },
    permissions: ctx.permissions,
    verificationStatus: ctx.verificationStatus,
    canPublish: canPublish(ctx.verificationStatus) && hasPermission(ctx.permissions, "publish:content"),
  }
}

export async function listUserWorkspaces(user: UserRow): Promise<Workspace[]> {
  const rows = await db
    .select({ workspace: workspaces, role: roles })
    .from(memberships)
    .innerJoin(workspaces, eq(workspaces.id, memberships.workspaceId))
    .innerJoin(roles, eq(roles.id, memberships.roleId))
    .where(eq(memberships.userId, user.id))
    .orderBy(memberships.createdAt)

  return Promise.all(
    rows.map(async ({ workspace, role }) => {
      const verification = await getVerification(workspace.id)
      return toWorkspaceDto({
        workspace,
        role,
        permissions: role.permissions,
        verificationStatus: verification.status as EVerificationStatus,
      })
    }),
  )
}
