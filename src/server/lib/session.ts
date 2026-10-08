import "server-only"

import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { DEMO_COOKIES } from "@/constants/demo"
import { db } from "@/server/db/client"
import { users, type UserRow } from "@/server/db/schema"
import { DEMO_USER } from "@/server/db/seed/fixtures"
import { AppError } from "./errors"
import { EErrorCode } from "@/enums/errors"

/**
 * Simulated auth: production auth is out of scope for the brief, so every
 * request acts as the seeded demo user unless the session cookie names another.
 */
export async function requireUser(): Promise<UserRow> {
  const userId = (await cookies()).get(DEMO_COOKIES.session)?.value ?? DEMO_USER.id
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) throw new AppError(EErrorCode.Unauthenticated, 401, "Your session has expired")
  return user
}
