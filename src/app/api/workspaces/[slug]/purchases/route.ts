import { purchaseListQuerySchema } from "@/lib/validation/queries"
import { handle, ok, parseQuery } from "@/server/lib/http"
import { tenantFrom } from "@/server/lib/route-context"
import { listPurchases } from "@/server/services/purchases"

export const GET = handle(async (req, ctx: RouteContext<"/api/workspaces/[slug]/purchases">) => {
  const params = parseQuery(req, purchaseListQuerySchema)
  return ok(await listPurchases(await tenantFrom(ctx), params))
})
