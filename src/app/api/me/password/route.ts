import { passwordChangeSchema } from "@/lib/validation/profile"
import { handle, ok, parseJson } from "@/server/lib/http"
import { requireUser } from "@/server/lib/session"
import { changePassword } from "@/server/services/profile"

export const POST = handle(async (req) => {
  const user = await requireUser()
  const input = await parseJson(req, passwordChangeSchema)
  await changePassword(user, input, req.headers.get("user-agent"))
  return ok({ changed: true })
})
