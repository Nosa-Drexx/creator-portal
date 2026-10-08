import { handle, ok } from "@/server/lib/http"
import { requireUser } from "@/server/lib/session"
import { acceptInvitationByToken, getInvitationByToken } from "@/server/services/invitations"

type Ctx = RouteContext<"/api/invitations/token/[token]">

export const GET = handle(async (_req, ctx: Ctx) => {
  const [user, { token }] = await Promise.all([requireUser(), ctx.params])
  return ok(await getInvitationByToken(user, token))
})

export const POST = handle(async (_req, ctx: Ctx) => {
  const [user, { token }] = await Promise.all([requireUser(), ctx.params])
  return ok(await acceptInvitationByToken(user, token))
})
