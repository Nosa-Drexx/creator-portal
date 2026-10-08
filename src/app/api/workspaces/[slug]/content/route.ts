import { contentPayloadSchema } from "@/lib/validation/content"
import { contentListQuerySchema } from "@/lib/validation/queries"
import { handle, ok, parseJson, parseQuery } from "@/server/lib/http"
import { tenantFrom } from "@/server/lib/route-context"
import { createContent, listContent } from "@/server/services/content"

export const GET = handle(async (req, ctx: RouteContext<"/api/workspaces/[slug]/content">) => {
  const params = parseQuery(req, contentListQuerySchema)
  return ok(await listContent(await tenantFrom(ctx), params))
})

/** Enforces the publishing rule: unverified workspaces get 403 VERIFICATION_REQUIRED */
export const POST = handle(async (req, ctx: RouteContext<"/api/workspaces/[slug]/content">) => {
  const tenant = await tenantFrom(ctx)
  const payload = await parseJson(req, contentPayloadSchema)
  return ok(await createContent(tenant, payload), { status: 201 })
})
