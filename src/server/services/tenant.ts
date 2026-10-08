import "server-only"

import { and, eq } from "drizzle-orm"
import { EVerificationStatus } from "@/enums/verification"
import { EWorkspaceRole } from "@/enums/workspace"
import { db } from "@/server/db/client"
import { memberships, workspaces, type UserRow, type WorkspaceRow } from "@/server/db/schema"
import { Errors } from "@/server/lib/errors"
import { requireUser } from "@/server/lib/session"
import type { Workspace } from "@/types/workspace"
import { canPublish } from "./publishing"
import { getVerification } from "./verification"

export interface TenantContext {
  user: UserRow
  workspace: WorkspaceRow
  role: EWorkspaceRole
  verificationStatus: EVerificationStatus
}

/**
 * Every workspace-scoped request goes through here. Non-members get a 404
 * rather than a 403 so workspace slugs can't be probed.
 */
export async function requireTenant(slug: string): Promise<TenantContext> {
  const user = await requireUser()
  const [match] = await db
    .select({ workspace: workspaces, role: memberships.role })
    .from(workspaces)
    .innerJoin(
      memberships,
      and(eq(memberships.workspaceId, workspaces.id), eq(memberships.userId, user.id)),
    )
    .where(eq(workspaces.slug, slug))
    .limit(1)

  if (!match) throw Errors.notFound("Workspace")

  const verification = await getVerification(match.workspace.id)
  return {
    user,
    workspace: match.workspace,
    role: match.role as EWorkspaceRole,
    verificationStatus: verification.status as EVerificationStatus,
  }
}

export function requireOwner(ctx: TenantContext) {
  if (ctx.role !== EWorkspaceRole.Owner) {
    throw Errors.forbidden("Only workspace owners can do that")
  }
}

export function toWorkspaceDto(ctx: Omit<TenantContext, "user">): Workspace {
  const { workspace } = ctx
  return {
    id: workspace.id,
    slug: workspace.slug,
    name: workspace.name,
    handle: workspace.handle,
    accentColor: workspace.accentColor,
    avatarUrl: workspace.avatarUrl,
    role: ctx.role,
    verificationStatus: ctx.verificationStatus,
    canPublish: canPublish(ctx.verificationStatus),
  }
}

export async function listUserWorkspaces(user: UserRow): Promise<Workspace[]> {
  const rows = await db
    .select({ workspace: workspaces, role: memberships.role })
    .from(memberships)
    .innerJoin(workspaces, eq(workspaces.id, memberships.workspaceId))
    .where(eq(memberships.userId, user.id))
    .orderBy(workspaces.createdAt)

  return Promise.all(
    rows.map(async ({ workspace, role }) => {
      const verification = await getVerification(workspace.id)
      return toWorkspaceDto({
        workspace,
        role: role as EWorkspaceRole,
        verificationStatus: verification.status as EVerificationStatus,
      })
    }),
  )
}
