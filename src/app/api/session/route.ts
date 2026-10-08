import { handle, ok } from "@/server/lib/http"
import { requireUser } from "@/server/lib/session"
import { listUserWorkspaces } from "@/server/services/tenant"

export const GET = handle(async () => {
  const user = await requireUser()
  const workspaces = await listUserWorkspaces(user)
  return ok({
    user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
    workspaces,
  })
})
