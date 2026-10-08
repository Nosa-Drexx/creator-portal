import { signupSchema } from "@/lib/validation/auth"
import { handle, ok, parseJson } from "@/server/lib/http"
import { toUserDto } from "@/server/lib/session"
import { signUp } from "@/server/services/auth"

export const POST = handle(
  async (req) => {
    const input = await parseJson(req, signupSchema)
    return ok(toUserDto(await signUp(input, req.headers.get("user-agent"))), { status: 201 })
  },
  { faults: false },
)
