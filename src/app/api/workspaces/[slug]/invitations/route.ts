import { inviteSchema } from "@/lib/validation/members"
import { handle, ok, parseJson } from "@/server/lib/http"
import { tenantFrom } from "@/server/lib/route-context"
import { createInvitation, listWorkspaceInvitations } from "@/server/services/invitations"

type Ctx = RouteContext<"/api/workspaces/[slug]/invitations">

export const GET = handle(async (_req, ctx: Ctx) => ok(await listWorkspaceInvitations(await tenantFrom(ctx))))

export const POST = handle(async (req, ctx: Ctx) => {
  const tenant = await tenantFrom(ctx)
  return ok(await createInvitation(tenant, await parseJson(req, inviteSchema)), { status: 201 })
})
