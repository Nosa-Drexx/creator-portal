import { contentPayloadSchema } from "@/lib/validation/content"
import { handle, ok, parseJson } from "@/server/lib/http"
import { tenantFrom } from "@/server/lib/route-context"
import { deleteContent, getContent, updateContent } from "@/server/services/content"

type Ctx = RouteContext<"/api/workspaces/[slug]/content/[id]">

export const GET = handle(async (_req, ctx: Ctx) => {
  const [tenant, { id }] = await Promise.all([tenantFrom(ctx), ctx.params])
  return ok(await getContent(tenant, id))
})

export const PUT = handle(async (req, ctx: Ctx) => {
  const [tenant, { id }] = await Promise.all([tenantFrom(ctx), ctx.params])
  const payload = await parseJson(req, contentPayloadSchema)
  return ok(await updateContent(tenant, id, payload))
})

export const DELETE = handle(async (_req, ctx: Ctx) => {
  const [tenant, { id }] = await Promise.all([tenantFrom(ctx), ctx.params])
  await deleteContent(tenant, id)
  return ok({ id })
})
