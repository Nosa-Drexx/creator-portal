import { profileSchema } from "@/lib/validation/profile"
import { handle, ok, parseJson } from "@/server/lib/http"
import { requireUser, toUserDto } from "@/server/lib/session"
import { updateProfile } from "@/server/services/profile"

export const PATCH = handle(async (req) => {
  const user = await requireUser()
  const input = await parseJson(req, profileSchema)
  return ok(toUserDto(await updateProfile(user, input)))
})
