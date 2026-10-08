import { createWorkspaceSchema } from "@/lib/validation/workspace"
import { handle, ok, parseJson } from "@/server/lib/http"
import { requireUser } from "@/server/lib/session"
import { createWorkspace } from "@/server/services/workspaces"

export const POST = handle(async (req) => {
  const user = await requireUser()
  const payload = await parseJson(req, createWorkspaceSchema)
  return ok(await createWorkspace(user, payload), { status: 201 })
})
