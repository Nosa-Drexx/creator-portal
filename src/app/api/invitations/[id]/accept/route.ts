import { handle, ok } from "@/server/lib/http"
import { requireUser } from "@/server/lib/session"
import { acceptInvitation } from "@/server/services/invitations"

export const POST = handle(async (_req, ctx: RouteContext<"/api/invitations/[id]/accept">) => {
  const [user, { id }] = await Promise.all([requireUser(), ctx.params])
  return ok(await acceptInvitation(user, id))
})
