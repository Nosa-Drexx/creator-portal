import { handle, ok } from "@/server/lib/http"
import { requireUser } from "@/server/lib/session"
import { declineInvitation } from "@/server/services/invitations"

export const POST = handle(async (_req, ctx: RouteContext<"/api/invitations/[id]/decline">) => {
  const [user, { id }] = await Promise.all([requireUser(), ctx.params])
  await declineInvitation(user, id)
  return ok({ id })
})
