import { z } from "zod"
import { handle, ok, parseJson } from "@/server/lib/http"
import { tenantFrom } from "@/server/lib/route-context"
import { signMediaKeys } from "@/server/services/uploads"

const schema = z.object({ keys: z.array(z.string().min(1)).min(1).max(50) })

export const POST = handle(
  async (req, ctx: RouteContext<"/api/workspaces/[slug]/media/sign">) => {
    const tenant = await tenantFrom(ctx)
    const { keys } = await parseJson(req, schema)
    return ok(await signMediaKeys(tenant, keys))
  },
  { faults: false },
)
