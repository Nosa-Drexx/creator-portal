import "server-only"

import { cookies } from "next/headers"
import { DEMO_COOKIES } from "@/constants/demo"
import { EErrorCode } from "@/enums/errors"
import { getSessionUser } from "@/server/auth/sessions"
import type { UserRow } from "@/server/db/schema"
import { AppError } from "./errors"

export async function requireUser(): Promise<UserRow> {
  const user = await getSessionUser()
  if (!user) {
    // Drop a stale cookie so the proxy doesn't bounce the user away from /login
    ;(await cookies()).delete(DEMO_COOKIES.session)
    throw new AppError(EErrorCode.Unauthenticated, 401, "Please log in to continue")
  }
  return user
}

export function toUserDto(user: UserRow) {
  return { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }
}
