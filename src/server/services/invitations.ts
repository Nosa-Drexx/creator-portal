import "server-only"

import { createHash, randomBytes } from "node:crypto"
import { and, eq, gt } from "drizzle-orm"
import { ESystemRole } from "@/constants/permissions"
import { db } from "@/server/db/client"
import { invitations, memberships, roles, users, workspaces, type UserRow } from "@/server/db/schema"
import { decrypt, encrypt } from "@/server/lib/crypto"
import { Errors } from "@/server/lib/errors"
import { newId } from "@/server/lib/ids"
import type { CreatedInvitation, MyInvitation, WorkspaceInvitation } from "@/types/members"
import { assertPermission } from "./permissions"
import type { TenantContext } from "./tenant"

const INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000
const hashToken = (token: string) => createHash("sha256").update(token).digest("base64url")
const TOKEN_PURPOSE = "invitation-token"
export const invitePath = (token: string) => `/invite/${token}`
const isOpen = () => and(eq(invitations.status, "pending"), gt(invitations.expiresAt, new Date()))

const invitationColumns = { invitation: invitations, role: roles, inviter: users }

function toWorkspaceInvitation(row: { invitation: typeof invitations.$inferSelect; role: typeof roles.$inferSelect; inviter: UserRow }): WorkspaceInvitation {
  return {
    id: row.invitation.id,
    email: row.invitation.email,
    role: { id: row.role.id, name: row.role.name },
    invitedBy: row.inviter.name,
    expiresAt: row.invitation.expiresAt.toISOString(),
    createdAt: row.invitation.createdAt.toISOString(),
  }
}

export async function listWorkspaceInvitations(ctx: TenantContext): Promise<WorkspaceInvitation[]> {
  assertPermission(ctx, "manage:members")
  const rows = await db
    .select(invitationColumns)
    .from(invitations)
    .innerJoin(roles, eq(roles.id, invitations.roleId))
    .innerJoin(users, eq(users.id, invitations.invitedById))
    .where(and(eq(invitations.workspaceId, ctx.workspace.id), isOpen()))
    .orderBy(invitations.createdAt)
  return rows.map(toWorkspaceInvitation)
}

export async function createInvitation(ctx: TenantContext, input: { email: string; roleId: string }): Promise<CreatedInvitation> {
  assertPermission(ctx, "manage:members")
  const role = await db.query.roles.findFirst({ where: and(eq(roles.id, input.roleId), eq(roles.workspaceId, ctx.workspace.id)) })
  if (!role) throw Errors.badRequest("That role doesn't exist in this workspace")
  if (role.systemKey === ESystemRole.Owner) throw Errors.forbidden("A workspace has a single owner, so you can't invite someone as Owner")

  const [existingMember] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(and(eq(memberships.workspaceId, ctx.workspace.id), eq(users.email, input.email)))
  if (existingMember) throw Errors.conflict("That person is already a member of this workspace")

  // Re-inviting replaces the old link rather than leaving two valid ones
  await db
    .update(invitations)
    .set({ status: "revoked", tokenCiphertext: null, updatedAt: new Date() })
    .where(and(eq(invitations.workspaceId, ctx.workspace.id), eq(invitations.email, input.email), eq(invitations.status, "pending")))

  const token = randomBytes(24).toString("base64url")
  const [invitation] = await db
    .insert(invitations)
    .values({
      id: newId("inv"),
      workspaceId: ctx.workspace.id,
      email: input.email,
      roleId: role.id,
      invitedById: ctx.user.id,
      tokenHash: hashToken(token),
      tokenCiphertext: encrypt(token, TOKEN_PURPOSE),
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    })
    .returning()

  return {
    invitation: toWorkspaceInvitation({ invitation, role, inviter: ctx.user }),
    inviteUrl: invitePath(token),
  }
}

/** Lets admins copy the same link again; lookups still go through the hash */
export async function getInvitationLink(ctx: TenantContext, invitationId: string) {
  assertPermission(ctx, "manage:members")
  const [row] = await db
    .select({ tokenCiphertext: invitations.tokenCiphertext })
    .from(invitations)
    .where(and(eq(invitations.id, invitationId), eq(invitations.workspaceId, ctx.workspace.id), isOpen()))
  if (!row) throw Errors.notFound("Invitation")
  if (!row.tokenCiphertext) throw Errors.conflict("This invitation's link can't be recovered. Revoke it and send a new one.")
  return { inviteUrl: invitePath(decrypt(row.tokenCiphertext, TOKEN_PURPOSE)) }
}

/**
 * Public, token-gated preview so a logged-out invitee knows what they're
 * joining and whether to sign up or log in. Holding the link proves it was shared with them.
 */
export async function getInvitationPreview(token: string) {
  const row = await findOpenInvitation(eq(invitations.tokenHash, hashToken(token)))
  if (!row) throw Errors.notFound("Invitation")
  const account = await db.query.users.findFirst({ where: eq(users.email, row.invitation.email), columns: { id: true } })
  return { ...toMyInvitation(row), email: row.invitation.email, hasAccount: !!account }
}

export async function revokeInvitation(ctx: TenantContext, invitationId: string) {
  assertPermission(ctx, "manage:members")
  const result = await db
    .update(invitations)
    .set({ status: "revoked", tokenCiphertext: null, updatedAt: new Date() })
    .where(and(eq(invitations.id, invitationId), eq(invitations.workspaceId, ctx.workspace.id), eq(invitations.status, "pending")))
    .returning()
  if (!result.length) throw Errors.notFound("Invitation")
}

async function findOpenInvitation(where: ReturnType<typeof eq>) {
  const [row] = await db
    .select({ invitation: invitations, role: roles, inviter: users, workspace: workspaces })
    .from(invitations)
    .innerJoin(roles, eq(roles.id, invitations.roleId))
    .innerJoin(users, eq(users.id, invitations.invitedById))
    .innerJoin(workspaces, eq(workspaces.id, invitations.workspaceId))
    .where(and(where, isOpen()))
  return row
}

type OpenInvitation = NonNullable<Awaited<ReturnType<typeof findOpenInvitation>>>

function toMyInvitation(row: OpenInvitation): MyInvitation {
  return {
    id: row.invitation.id,
    workspace: { name: row.workspace.name, slug: row.workspace.slug, accentColor: row.workspace.accentColor },
    role: { name: row.role.name },
    invitedBy: row.inviter.name,
    expiresAt: row.invitation.expiresAt.toISOString(),
  }
}

export async function listMyInvitations(user: UserRow): Promise<MyInvitation[]> {
  const rows = await db
    .select({ invitation: invitations, role: roles, inviter: users, workspace: workspaces })
    .from(invitations)
    .innerJoin(roles, eq(roles.id, invitations.roleId))
    .innerJoin(users, eq(users.id, invitations.invitedById))
    .innerJoin(workspaces, eq(workspaces.id, invitations.workspaceId))
    .where(and(eq(invitations.email, user.email), isOpen()))
  return rows.map(toMyInvitation)
}

export async function getInvitationByToken(user: UserRow, token: string) {
  const row = await findOpenInvitation(eq(invitations.tokenHash, hashToken(token)))
  if (!row) throw Errors.notFound("Invitation")
  return { ...toMyInvitation(row), forYou: row.invitation.email === user.email, email: row.invitation.email }
}

/** Invites are bound to an email address, so a forwarded link can't be used by someone else */
async function accept(user: UserRow, row: OpenInvitation | undefined) {
  if (!row) throw Errors.notFound("Invitation")
  if (row.invitation.email !== user.email) {
    throw Errors.forbidden(`This invitation was sent to ${row.invitation.email}. Log in with that account to accept it.`)
  }
  await db.transaction(async (tx) => {
    const [already] = await tx
      .select({ id: memberships.id })
      .from(memberships)
      .where(and(eq(memberships.workspaceId, row.workspace.id), eq(memberships.userId, user.id)))
    if (!already) {
      await tx.insert(memberships).values({ id: newId("mem"), workspaceId: row.workspace.id, userId: user.id, roleId: row.role.id })
    }
    await tx.update(invitations).set({ status: "accepted", tokenCiphertext: null, updatedAt: new Date() }).where(eq(invitations.id, row.invitation.id))
  })
  // Permissions let the client land on a page the new role can actually open
  return { slug: row.workspace.slug, permissions: row.role.permissions }
}

export const acceptInvitation = async (user: UserRow, id: string) =>
  accept(user, await findOpenInvitation(eq(invitations.id, id)))

export const acceptInvitationByToken = async (user: UserRow, token: string) =>
  accept(user, await findOpenInvitation(eq(invitations.tokenHash, hashToken(token))))

export async function declineInvitation(user: UserRow, id: string) {
  const row = await findOpenInvitation(eq(invitations.id, id))
  if (!row || row.invitation.email !== user.email) throw Errors.notFound("Invitation")
  await db.update(invitations).set({ status: "declined", tokenCiphertext: null, updatedAt: new Date() }).where(eq(invitations.id, id))
}
