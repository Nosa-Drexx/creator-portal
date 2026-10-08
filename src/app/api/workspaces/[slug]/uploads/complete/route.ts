import { z } from "zod"
import { handle, ok, parseJson } from "@/server/lib/http"
import { tenantFrom } from "@/server/lib/route-context"
import { completeUpload } from "@/server/services/uploads"

const schema = z.object({ key: z.string().min(1).max(300) })

export const POST = handle(async (req, ctx: RouteContext<"/api/workspaces/[slug]/uploads/complete">) => {
  const tenant = await tenantFrom(ctx)
  const { key } = await parseJson(req, schema)
  return ok(await completeUpload(tenant, key))
})
