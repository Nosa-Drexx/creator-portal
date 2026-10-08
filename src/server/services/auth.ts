import "server-only"

import { eq } from "drizzle-orm"
import { EErrorCode } from "@/enums/errors"
import { createSession, destroySession } from "@/server/auth/sessions"
import { hashPassword, verifyPassword } from "@/server/auth/password"
import { clearFailures, isRateLimited, recordFailure } from "@/server/auth/rate-limit"
import { db } from "@/server/db/client"
import { users } from "@/server/db/schema"
import { AppError, Errors } from "@/server/lib/errors"
import { newId } from "@/server/lib/ids"
import type { LoginInput, SignupInput } from "@/lib/validation/auth"

// Same message for unknown email and wrong password, so accounts can't be enumerated
const INVALID = () => new AppError(EErrorCode.Unauthenticated, 401, "That email and password don't match")

export async function logIn(input: LoginInput, userAgent: string | null) {
  if (isRateLimited(input.email)) {
    throw new AppError(EErrorCode.RateLimited, 429, "Too many attempts. Please wait a few minutes and try again.")
  }
  const user = await db.query.users.findFirst({ where: eq(users.email, input.email) })
  const valid = !!user && !!user.passwordHash && (await verifyPassword(input.password, user.passwordHash))
  if (!user || !valid) {
    recordFailure(input.email)
    throw INVALID()
  }
  clearFailures(input.email)
  await createSession(user.id, userAgent)
  return user
}

export async function signUp(input: SignupInput, userAgent: string | null) {
  const existing = await db.query.users.findFirst({ where: eq(users.email, input.email) })
  if (existing) throw Errors.conflict("An account with this email already exists. Try logging in.")

  const [user] = await db
    .insert(users)
    .values({ id: newId("usr"), name: input.name, email: input.email, passwordHash: await hashPassword(input.password) })
    .returning()
  await createSession(user.id, userAgent)
  return user
}

export const logOut = () => destroySession()
