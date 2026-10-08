import "server-only"

import { randomUUID } from "node:crypto"
import { and, eq, ne } from "drizzle-orm"
import { AVATAR_MAX_BYTES, AVATAR_TYPES, type PasswordChangeInput, type ProfileInput } from "@/lib/validation/profile"
import { hashPassword, verifyPassword } from "@/server/auth/password"
import { createSession } from "@/server/auth/sessions"
import { db } from "@/server/db/client"
import { sessions, users, type UserRow } from "@/server/db/schema"
import { AppError, Errors } from "@/server/lib/errors"
import { EErrorCode } from "@/enums/errors"
import { writeObject } from "@/server/storage/local"

const EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }

export async function updateProfile(user: UserRow, input: ProfileInput) {
  if (input.email !== user.email) {
    const taken = await db.query.users.findFirst({ where: and(eq(users.email, input.email), ne(users.id, user.id)) })
    if (taken) throw Errors.conflict("That email is already used by another account")
  }
  const [row] = await db
    .update(users)
    .set({ name: input.name, email: input.email, updatedAt: new Date() })
    .where(eq(users.id, user.id))
    .returning()
  return row
}

/** Changing the password signs out every other device */
export async function changePassword(user: UserRow, input: PasswordChangeInput, userAgent: string | null) {
  if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
    throw new AppError(EErrorCode.ValidationFailed, 422, "Your current password is incorrect", {
      currentPassword: ["Your current password is incorrect"],
    })
  }
  await db
    .update(users)
    .set({ passwordHash: await hashPassword(input.newPassword), updatedAt: new Date() })
    .where(eq(users.id, user.id))
  await db.delete(sessions).where(eq(sessions.userId, user.id))
  await createSession(user.id, userAgent)
}

export function avatarKey(userId: string, file: string) {
  return `avatars/${userId}/${file}`
}

export async function saveAvatar(user: UserRow, contentType: string, body: ReadableStream<Uint8Array> | null) {
  if (!AVATAR_TYPES.includes(contentType)) throw Errors.badRequest("Use a JPG, PNG or WebP image")
  if (!body) throw Errors.badRequest("Missing image")
  const file = `${randomUUID()}.${EXTENSIONS[contentType]}`
  await writeObject(avatarKey(user.id, file), body, AVATAR_MAX_BYTES)
  // The file name is the cache-buster, so the URL can be cached aggressively
  const avatarUrl = `/api/avatars/${user.id}/${file}`
  const [row] = await db.update(users).set({ avatarUrl, updatedAt: new Date() }).where(eq(users.id, user.id)).returning()
  return row
}

export async function removeAvatar(user: UserRow) {
  const [row] = await db.update(users).set({ avatarUrl: null, updatedAt: new Date() }).where(eq(users.id, user.id)).returning()
  return row
}
