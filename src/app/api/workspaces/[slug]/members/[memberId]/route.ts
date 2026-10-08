import { changeRoleSchema } from "@/lib/validation/members"
import { handle, ok, parseJson } from "@/server/lib/http"
import { tenantFrom } from "@/server/lib/route-context"
import { changeMemberRole, removeMember } from "@/server/services/members"

type Ctx = RouteContext<"/api/workspaces/[slug]/members/[memberId]">

export const PATCH = handle(async (req, ctx: Ctx) => {
  const [tenant, { memberId }] = await Promise.all([tenantFrom(ctx), ctx.params])
  const { roleId } = await parseJson(req, changeRoleSchema)
  await changeMemberRole(tenant, memberId, roleId)
  return ok({ memberId, roleId })
})

export const DELETE = handle(async (_req, ctx: Ctx) => {
  const [tenant, { memberId }] = await Promise.all([tenantFrom(ctx), ctx.params])
  await removeMember(tenant, memberId)
  return ok({ memberId })
})
