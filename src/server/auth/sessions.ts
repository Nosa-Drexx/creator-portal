import "server-only"

import { createHash, randomBytes } from "node:crypto"
import { and, eq, gt } from "drizzle-orm"
import { cookies } from "next/headers"
import { DEMO_COOKIES } from "@/constants/demo"
import { db } from "@/server/db/client"
import { sessions, users } from "@/server/db/schema"
import { newId } from "@/server/lib/ids"

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

const hashToken = (token: string) => createHash("sha256").update(token).digest("base64url")

export async function createSession(userId: string, userAgent?: string | null) {
  const token = randomBytes(32).toString("base64url")
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await db.insert(sessions).values({
    id: newId("ses"),
    tokenHash: hashToken(token),
    userId,
    expiresAt,
    userAgent: userAgent?.slice(0, 200) ?? null,
  })
  ;(await cookies()).set(DEMO_COOKIES.session, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  })
}

export async function getSessionUser() {
  const token = (await cookies()).get(DEMO_COOKIES.session)?.value
  if (!token) return null
  const [row] = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1)
  return row?.user ?? null
}

export async function destroySession() {
  const jar = await cookies()
  const token = jar.get(DEMO_COOKIES.session)?.value
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)))
  jar.delete(DEMO_COOKIES.session)
}
