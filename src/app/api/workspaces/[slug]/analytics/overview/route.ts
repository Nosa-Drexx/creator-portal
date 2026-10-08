import { handle, ok } from "@/server/lib/http"
import { tenantFrom } from "@/server/lib/route-context"
import { getOverview } from "@/server/services/analytics"

export const GET = handle(async (_req, ctx: RouteContext<"/api/workspaces/[slug]/analytics/overview">) => {
  return ok(await getOverview(await tenantFrom(ctx)))
})
