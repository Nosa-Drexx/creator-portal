import { handle, ok } from "@/server/lib/http"
import { requireUser } from "@/server/lib/session"
import { listMyInvitations } from "@/server/services/invitations"

export const GET = handle(async () => ok(await listMyInvitations(await requireUser())))
