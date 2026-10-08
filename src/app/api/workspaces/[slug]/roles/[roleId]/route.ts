import { roleSchema } from "@/lib/validation/members"
import { handle, ok, parseJson } from "@/server/lib/http"
import { tenantFrom } from "@/server/lib/route-context"
import { deleteRole, updateRole } from "@/server/services/roles"

type Ctx = RouteContext<"/api/workspaces/[slug]/roles/[roleId]">

export const PUT = handle(async (req, ctx: Ctx) => {
  const [tenant, { roleId }] = await Promise.all([tenantFrom(ctx), ctx.params])
  return ok(await updateRole(tenant, roleId, await parseJson(req, roleSchema)))
})

export const DELETE = handle(async (_req, ctx: Ctx) => {
  const [tenant, { roleId }] = await Promise.all([tenantFrom(ctx), ctx.params])
  await deleteRole(tenant, roleId)
  return ok({ roleId })
})
