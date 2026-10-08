import { verificationPayloadSchema } from "@/lib/validation/verification"
import { handle, ok, parseJson } from "@/server/lib/http"
import { tenantFrom } from "@/server/lib/route-context"
import { requireOwner } from "@/server/services/tenant"
import { getVerification, submitVerification, toVerificationDto } from "@/server/services/verification"

type Ctx = RouteContext<"/api/workspaces/[slug]/verification">

export const GET = handle(async (_req, ctx: Ctx) => {
  const tenant = await tenantFrom(ctx)
  return ok(toVerificationDto(await getVerification(tenant.workspace.id)))
})

export const POST = handle(async (req, ctx: Ctx) => {
  const tenant = await tenantFrom(ctx)
  requireOwner(tenant)
  const payload = await parseJson(req, verificationPayloadSchema)
  return ok(toVerificationDto(await submitVerification(tenant, payload)))
})
