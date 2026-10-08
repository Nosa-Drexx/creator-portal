import { handle, ok } from "@/server/lib/http"
import { requireUser, toUserDto } from "@/server/lib/session"
import { listUserWorkspaces } from "@/server/services/tenant"

// The app shell stays up in the demo's "Failing" mode, so reviewers can still reach the toggle
export const GET = handle(async () => {
  const user = await requireUser()
  const workspaces = await listUserWorkspaces(user)
  return ok({
    user: toUserDto(user),
    workspaces,
  })
}, { faults: false })
