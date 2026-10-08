import "server-only"

import { and, count, eq } from "drizzle-orm"
import { ESystemRole, MANAGE_ALL } from "@/constants/permissions"
import { db } from "@/server/db/client"
import { memberships, roles, users } from "@/server/db/schema"
import { Errors } from "@/server/lib/errors"
import { toUserDto } from "@/server/lib/session"
import type { Member } from "@/types/members"
import { assertPermission, hasPermission } from "./permissions"
import type { TenantContext } from "./tenant"

async function ownerCount(workspaceId: string) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(memberships)
    .innerJoin(roles, eq(roles.id, memberships.roleId))
    .where(and(eq(memberships.workspaceId, workspaceId), eq(roles.systemKey, ESystemRole.Owner)))
  return total
}

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

export async function changeMemberRole(ctx: TenantContext, memberId: string, roleId: string) {
  assertPermission(ctx, "manage:members")
  const { membership, role: current } = await findMember(ctx, memberId)
  const next = await db.query.roles.findFirst({ where: and(eq(roles.id, roleId), eq(roles.workspaceId, ctx.workspace.id)) })
  if (!next) throw Errors.badRequest("That role doesn't exist in this workspace")

  const touchesOwner = next.systemKey === ESystemRole.Owner || current.systemKey === ESystemRole.Owner
  if (touchesOwner && !hasPermission(ctx.permissions, MANAGE_ALL)) {
    throw Errors.forbidden("Only owners can grant or remove ownership")
  }
  if (current.systemKey === ESystemRole.Owner && next.systemKey !== ESystemRole.Owner && (await ownerCount(ctx.workspace.id)) <= 1) {
    throw Errors.conflict("A workspace needs at least one owner. Make someone else an owner first.")
  }
  await db.update(memberships).set({ roleId, updatedAt: new Date() }).where(eq(memberships.id, membership.id))
}

/** Removing someone else needs manage:members; anyone can leave */
export async function removeMember(ctx: TenantContext, memberId: string) {
  const { membership, role } = await findMember(ctx, memberId)
  const isSelf = membership.userId === ctx.user.id
  if (!isSelf) assertPermission(ctx, "manage:members")
  if (role.systemKey === ESystemRole.Owner) {
    if (!isSelf && !hasPermission(ctx.permissions, MANAGE_ALL)) throw Errors.forbidden("Only owners can remove an owner")
    if ((await ownerCount(ctx.workspace.id)) <= 1) {
      throw Errors.conflict("The last owner can't leave. Make someone else an owner first.")
    }
  }
  await db.delete(memberships).where(eq(memberships.id, membership.id))
}
