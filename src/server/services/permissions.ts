import { MANAGE_ALL, type Permission } from "@/constants/permissions"
import { Errors } from "@/server/lib/errors"

export function hasPermission(granted: readonly string[], code: Permission) {
  return granted.includes(MANAGE_ALL) || granted.includes(code)
}

export function assertPermission(ctx: { permissions: readonly string[] }, code: Permission, message?: string) {
  if (!hasPermission(ctx.permissions, code)) {
    throw Errors.forbidden(message ?? "Your role doesn't allow this. Ask a workspace admin for access.")
  }
}
