import "server-only"

import { count, eq, like } from "drizzle-orm"
import { MAX_WORKSPACES_PER_USER, slugify } from "@/constants/workspace"
import { EVerificationStatus } from "@/enums/verification"
import { ESystemRole } from "@/constants/permissions"
import { db } from "@/server/db/client"
import { memberships, roles, verifications, workspaces, type UserRow } from "@/server/db/schema"
import { Errors } from "@/server/lib/errors"
import { newId } from "@/server/lib/ids"
import type { Workspace } from "@/types/workspace"
import { createSystemRoles } from "./system-roles"
import { toWorkspaceDto } from "./tenant"

interface CreateWorkspacePayload {
  name: string
  handle: string
  accentColor: string
}

/** Slugs are global (they're in the URL), so append a counter on collisions */
async function uniqueSlug(name: string) {
  const base = slugify(name) || "workspace"
  const taken = new Set(
    (await db.select({ slug: workspaces.slug }).from(workspaces).where(like(workspaces.slug, `${base}%`))).map(
      (r) => r.slug,
    ),
  )
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}

export async function createWorkspace(user: UserRow, payload: CreateWorkspacePayload): Promise<Workspace> {
  const [{ total }] = await db.select({ total: count() }).from(memberships).where(eq(memberships.userId, user.id))
  if (total >= MAX_WORKSPACES_PER_USER) {
    throw Errors.conflict(`You can belong to up to ${MAX_WORKSPACES_PER_USER} workspaces`)
  }

  const slug = await uniqueSlug(payload.name)
  const workspaceId = newId("ws")

  // One transaction: a workspace never exists without its roles, owner or verification record
  const { workspace, ownerRole } = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(workspaces)
      .values({ id: workspaceId, slug, name: payload.name, handle: payload.handle, accentColor: payload.accentColor })
      .returning()
    const roleIds = await createSystemRoles(tx, workspaceId)
    await tx
      .insert(memberships)
      .values({ id: newId("mem"), workspaceId, userId: user.id, roleId: roleIds[ESystemRole.Owner] })
    await tx
      .insert(verifications)
      .values({ id: newId("ver"), workspaceId, status: EVerificationStatus.Unverified })
    const [owner] = await tx.select().from(roles).where(eq(roles.id, roleIds[ESystemRole.Owner]))
    return { workspace: row, ownerRole: owner }
  })

  return toWorkspaceDto({
    workspace,
    role: ownerRole,
    permissions: ownerRole.permissions,
    verificationStatus: EVerificationStatus.Unverified,
  })
}
