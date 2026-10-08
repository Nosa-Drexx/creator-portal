import { verificationPayloadSchema } from "@/lib/validation/verification"
import { handle, ok, parseJson } from "@/server/lib/http"
import { tenantFrom } from "@/server/lib/route-context"
import { assertPermission } from "@/server/services/permissions"
import { getVerification, submitVerification, toVerificationDto } from "@/server/services/verification"

type Ctx = RouteContext<"/api/workspaces/[slug]/verification">

export const GET = handle(async (_req, ctx: Ctx) => {
  const tenant = await tenantFrom(ctx)
  assertPermission(tenant, "view:verification")
  return ok(toVerificationDto(await getVerification(tenant.workspace.id)))
})

export const POST = handle(async (req, ctx: Ctx) => {
  const tenant = await tenantFrom(ctx)
  assertPermission(tenant, "manage:verification", "Only members who can manage verification can submit it.")
  const payload = await parseJson(req, verificationPayloadSchema)
  return ok(toVerificationDto(await submitVerification(tenant, payload)))
})
