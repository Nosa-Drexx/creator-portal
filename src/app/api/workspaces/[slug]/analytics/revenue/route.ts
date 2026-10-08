import { analyticsQuerySchema } from "@/lib/validation/queries"
import { handle, ok, parseQuery } from "@/server/lib/http"
import { tenantFrom } from "@/server/lib/route-context"
import { getRevenueSeries } from "@/server/services/analytics"

export const GET = handle(async (req, ctx: RouteContext<"/api/workspaces/[slug]/analytics/revenue">) => {
  const { range } = parseQuery(req, analyticsQuerySchema)
  return ok(await getRevenueSeries(await tenantFrom(ctx), range))
})
