import "server-only"

import { and, count, eq, ne } from "drizzle-orm"
import { db } from "@/server/db/client"
import { memberships, roles, type RoleRow } from "@/server/db/schema"
import { Errors } from "@/server/lib/errors"
import { newId } from "@/server/lib/ids"
import type { RoleSummary } from "@/types/members"
import { assertPermission, hasPermission } from "./permissions"
import type { TenantContext } from "./tenant"

interface RoleInput {
  name: string
  description: string
  permissions: string[]
}

/** Prevents privilege escalation: you can only grant what you already have */
function assertCanGrant(ctx: TenantContext, permissions: string[]) {
  const missing = permissions.filter((p) => !hasPermission(ctx.permissions, p as never))
  if (missing.length) throw Errors.forbidden(`You can't grant permissions you don't have: ${missing.join(", ")}`)
}

async function assertUniqueName(ctx: TenantContext, name: string, exceptId?: string) {
  const clash = await db.query.roles.findFirst({
    where: and(eq(roles.workspaceId, ctx.workspace.id), eq(roles.name, name), exceptId ? ne(roles.id, exceptId) : undefined),
  })
  if (clash) throw Errors.conflict(`A role called "${name}" already exists`)
}

async function findCustomRole(ctx: TenantContext, roleId: string): Promise<RoleRow> {
  const role = await db.query.roles.findFirst({ where: and(eq(roles.id, roleId), eq(roles.workspaceId, ctx.workspace.id)) })
  if (!role) throw Errors.notFound("Role")
  if (role.systemKey) throw Errors.forbidden("Built-in roles can't be changed. Create a custom role instead.")
  return role
}

export async function listRoles(ctx: TenantContext): Promise<RoleSummary[]> {
  assertPermission(ctx, "view:members")
  const rows = await db
    .select({ role: roles, memberCount: count(memberships.id) })
    .from(roles)
    .leftJoin(memberships, eq(memberships.roleId, roles.id))
    .where(eq(roles.workspaceId, ctx.workspace.id))
    .groupBy(roles.id)
    .orderBy(roles.createdAt)
  return rows.map(({ role, memberCount }) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    systemKey: role.systemKey,
    permissions: role.permissions,
    memberCount,
  }))
}

export async function createRole(ctx: TenantContext, input: RoleInput) {
  assertPermission(ctx, "manage:roles")
  assertCanGrant(ctx, input.permissions)
  await assertUniqueName(ctx, input.name)
  const [row] = await db
    .insert(roles)
    .values({ id: newId("rol"), workspaceId: ctx.workspace.id, ...input })
    .returning()
  return row
}

export async function updateRole(ctx: TenantContext, roleId: string, input: RoleInput) {
  assertPermission(ctx, "manage:roles")
  await findCustomRole(ctx, roleId)
  assertCanGrant(ctx, input.permissions)
  await assertUniqueName(ctx, input.name, roleId)
  const [row] = await db
    .update(roles)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(roles.id, roleId))
    .returning()
  return row
}

export async function deleteRole(ctx: TenantContext, roleId: string) {
  assertPermission(ctx, "manage:roles")
  await findCustomRole(ctx, roleId)
  const [{ total }] = await db.select({ total: count() }).from(memberships).where(eq(memberships.roleId, roleId))
  if (total > 0) throw Errors.conflict(`${total} ${total === 1 ? "member has" : "members have"} this role. Move them to another role first.`)
  await db.delete(roles).where(eq(roles.id, roleId))
}
