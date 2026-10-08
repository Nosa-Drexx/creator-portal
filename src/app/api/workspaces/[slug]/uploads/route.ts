import { uploadIntentSchema } from "@/lib/validation/queries"
import { handle, ok, parseJson } from "@/server/lib/http"
import { tenantFrom } from "@/server/lib/route-context"
import { createUploadIntent } from "@/server/services/uploads"

export const POST = handle(async (req, ctx: RouteContext<"/api/workspaces/[slug]/uploads">) => {
  const tenant = await tenantFrom(ctx)
  const payload = await parseJson(req, uploadIntentSchema)
  return ok(await createUploadIntent(tenant, payload), { status: 201 })
})
