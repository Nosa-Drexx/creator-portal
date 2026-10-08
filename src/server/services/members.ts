import "server-only"

import { and, eq } from "drizzle-orm"
import { ESystemRole } from "@/constants/permissions"
import { db } from "@/server/db/client"
import { memberships, roles, users } from "@/server/db/schema"
import { Errors } from "@/server/lib/errors"
import { toUserDto } from "@/server/lib/session"
import type { Member } from "@/types/members"
import { assertPermission } from "./permissions"
import type { TenantContext } from "./tenant"

async function findMember(ctx: TenantContext, memberId: string) {
  const [row] = await db
    .select({ membership: memberships, role: roles })
    .from(memberships)
    .innerJoin(roles, eq(roles.id, memberships.roleId))
    .where(and(eq(memberships.id, memberId), eq(memberships.workspaceId, ctx.workspace.id)))
  if (!row) throw Errors.notFound("Member")
  return row
}

export async function listMembers(ctx: TenantContext): Promise<Member[]> {
  assertPermission(ctx, "view:members")
  const rows = await db
    .select({ membership: memberships, user: users, role: roles })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .innerJoin(roles, eq(roles.id, memberships.roleId))
    .where(eq(memberships.workspaceId, ctx.workspace.id))
    .orderBy(memberships.createdAt)

  return rows.map(({ membership, user, role }) => ({
    id: membership.id,
    user: toUserDto(user),
    role: { id: role.id, name: role.name, systemKey: role.systemKey },
    joinedAt: membership.createdAt.toISOString(),
    isYou: user.id === ctx.user.id,
  }))
}

export const OWNER_LOCKED = "The workspace owner's role and membership can't be changed"

export async function changeMemberRole(ctx: TenantContext, memberId: string, roleId: string) {
  assertPermission(ctx, "manage:members")
  const { membership, role: current } = await findMember(ctx, memberId)
  if (membership.userId === ctx.user.id) throw Errors.forbidden("You can't change your own role. Ask another admin.")
  if (current.systemKey === ESystemRole.Owner) throw Errors.forbidden(OWNER_LOCKED)

  const next = await db.query.roles.findFirst({ where: and(eq(roles.id, roleId), eq(roles.workspaceId, ctx.workspace.id)) })
  if (!next) throw Errors.badRequest("That role doesn't exist in this workspace")
  // One fixed owner per workspace; ownership transfer would be a separate, deliberate flow
  if (next.systemKey === ESystemRole.Owner) throw Errors.forbidden("A workspace has a single owner, so the Owner role can't be assigned")

  await db.update(memberships).set({ roleId, updatedAt: new Date() }).where(eq(memberships.id, membership.id))
}

/** Removing someone else needs manage:members; anyone except the owner can leave */
export async function removeMember(ctx: TenantContext, memberId: string) {
  const { membership, role } = await findMember(ctx, memberId)
  if (role.systemKey === ESystemRole.Owner) throw Errors.forbidden(OWNER_LOCKED)
  if (membership.userId !== ctx.user.id) assertPermission(ctx, "manage:members")
  await db.delete(memberships).where(eq(memberships.id, membership.id))
}
