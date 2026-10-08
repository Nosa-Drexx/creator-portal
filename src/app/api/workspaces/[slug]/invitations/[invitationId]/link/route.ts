import { handle, ok } from "@/server/lib/http"
import { tenantFrom } from "@/server/lib/route-context"
import { getInvitationLink } from "@/server/services/invitations"

export const GET = handle(async (_req, ctx: RouteContext<"/api/workspaces/[slug]/invitations/[invitationId]/link">) => {
  const [tenant, { invitationId }] = await Promise.all([tenantFrom(ctx), ctx.params])
  return ok(await getInvitationLink(tenant, invitationId))
})
