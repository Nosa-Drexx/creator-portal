import { handle, ok } from "@/server/lib/http"
import { tenantFrom } from "@/server/lib/route-context"
import { revokeInvitation } from "@/server/services/invitations"

export const DELETE = handle(async (_req, ctx: RouteContext<"/api/workspaces/[slug]/invitations/[invitationId]">) => {
  const [tenant, { invitationId }] = await Promise.all([tenantFrom(ctx), ctx.params])
  await revokeInvitation(tenant, invitationId)
  return ok({ invitationId })
})
