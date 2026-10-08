import { loginSchema } from "@/lib/validation/auth"
import { handle, ok, parseJson } from "@/server/lib/http"
import { toUserDto } from "@/server/lib/session"
import { logIn } from "@/server/services/auth"

export const POST = handle(
  async (req) => {
    const input = await parseJson(req, loginSchema)
    return ok(toUserDto(await logIn(input, req.headers.get("user-agent"))))
  },
  { faults: false },
)
