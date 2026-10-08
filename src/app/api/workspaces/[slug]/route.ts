import { handle, ok } from "@/server/lib/http"
import { tenantFrom } from "@/server/lib/route-context"
import { toWorkspaceDto } from "@/server/services/tenant"

// Part of the app shell, so it ignores the demo's simulated faults (see /api/session)
export const GET = handle(
  async (_req, ctx: RouteContext<"/api/workspaces/[slug]">) => ok(toWorkspaceDto(await tenantFrom(ctx))),
  { faults: false },
)
