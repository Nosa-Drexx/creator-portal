import { handle, ok } from "@/server/lib/http"
import { logOut } from "@/server/services/auth"

export const POST = handle(
  async () => {
    await logOut()
    return ok({ loggedOut: true })
  },
  { faults: false },
)
