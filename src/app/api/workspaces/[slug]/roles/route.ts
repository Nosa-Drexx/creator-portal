import { roleSchema } from "@/lib/validation/members"
import { handle, ok, parseJson } from "@/server/lib/http"
import { tenantFrom } from "@/server/lib/route-context"
import { createRole, listRoles } from "@/server/services/roles"

type Ctx = RouteContext<"/api/workspaces/[slug]/roles">

export const GET = handle(async (_req, ctx: Ctx) => ok(await listRoles(await tenantFrom(ctx))))

export const POST = handle(async (req, ctx: Ctx) => {
  const tenant = await tenantFrom(ctx)
  return ok(await createRole(tenant, await parseJson(req, roleSchema)), { status: 201 })
})
