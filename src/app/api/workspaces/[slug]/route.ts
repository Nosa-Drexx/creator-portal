import { handle, ok } from "@/server/lib/http"
import { tenantFrom } from "@/server/lib/route-context"
import { toWorkspaceDto } from "@/server/services/tenant"

export const GET = handle(async (_req, ctx: RouteContext<"/api/workspaces/[slug]">) => {
  return ok(toWorkspaceDto(await tenantFrom(ctx)))
})
