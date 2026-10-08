import { handle, ok } from "@/server/lib/http"
import { getInvitationPreview } from "@/server/services/invitations"

/** No session required: invitees usually aren't signed in yet */
export const GET = handle(async (_req, ctx: RouteContext<"/api/invitations/preview/[token]">) => {
  const { token } = await ctx.params
  return ok(await getInvitationPreview(token))
})
