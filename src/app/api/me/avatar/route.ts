import { handle, ok } from "@/server/lib/http"
import { requireUser, toUserDto } from "@/server/lib/session"
import { removeAvatar, saveAvatar } from "@/server/services/profile"

export const PUT = handle(async (req) => {
  const user = await requireUser()
  return ok(toUserDto(await saveAvatar(user, req.headers.get("content-type") ?? "", req.body)))
})

export const DELETE = handle(async () => {
  const user = await requireUser()
  return ok(toUserDto(await removeAvatar(user)))
})
