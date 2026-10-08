import { cookies } from "next/headers"
import { z } from "zod"
import { DEMO_COOKIES, EDemoFault } from "@/constants/demo"
import { EVerificationStatus } from "@/enums/verification"
import { resetDatabase } from "@/server/db/setup"
import { eq } from "drizzle-orm"
import { createSession } from "@/server/auth/sessions"
import { db } from "@/server/db/client"
import { users } from "@/server/db/schema"
import { handle, ok, parseJson } from "@/server/lib/http"
import { requireUser } from "@/server/lib/session"
import { assertPermission } from "@/server/services/permissions"
import { requireTenant } from "@/server/services/tenant"
import { setVerificationStatus } from "@/server/services/verification"
import { clearObjects } from "@/server/storage"

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("reset") }),
  z.object({ action: z.literal("fault"), value: z.enum(EDemoFault) }),
  z.object({
    action: z.literal("verification"),
    workspace: z.string().min(1),
    status: z.enum(EVerificationStatus),
  }),
])

export const GET = handle(
  async () => {
    const fault = (await cookies()).get(DEMO_COOKIES.fault)?.value ?? EDemoFault.None
    return ok({ fault })
  },
  { faults: false },
)

/** Demo-state controls for reviewers; would not exist in production */
export const POST = handle(
  async (req) => {
    const user = await requireUser()
    const body = await parseJson(req, schema)
    const jar = await cookies()

    if (body.action === "reset") {
      await clearObjects()
      jar.delete(DEMO_COOKIES.fault)
      const result = await resetDatabase()
      // Reseeding clears sessions; keep a seeded reviewer signed in
      const seeded = await db.query.users.findFirst({ where: eq(users.email, user.email) })
      if (seeded) await createSession(seeded.id, req.headers.get("user-agent"))
      return ok({ ...result, signedOut: !seeded })
    }

    if (body.action === "fault") {
      if (body.value === EDemoFault.None) jar.delete(DEMO_COOKIES.fault)
      else jar.set(DEMO_COOKIES.fault, body.value, { path: "/", sameSite: "lax", httpOnly: true })
      return ok({ fault: body.value })
    }

    const tenant = await requireTenant(body.workspace)
    assertPermission(tenant, "manage:verification")
    await setVerificationStatus(tenant.workspace.id, body.status)
    return ok({ status: body.status })
  },
  { faults: false },
)
