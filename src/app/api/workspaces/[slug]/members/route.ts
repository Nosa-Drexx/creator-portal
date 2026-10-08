import { handle, ok } from "@/server/lib/http"
import { tenantFrom } from "@/server/lib/route-context"
import { listMembers } from "@/server/services/members"

export const GET = handle(async (_req, ctx: RouteContext<"/api/workspaces/[slug]/members">) => {
  return ok(await listMembers(await tenantFrom(ctx)))
})
