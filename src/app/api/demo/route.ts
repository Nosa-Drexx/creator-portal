import { rm } from "node:fs/promises"
import path from "node:path"
import { cookies } from "next/headers"
import { z } from "zod"
import { DEMO_COOKIES, EDemoFault } from "@/constants/demo"
import { EVerificationStatus } from "@/enums/verification"
import { resetDatabase } from "@/server/db/setup"
import { env } from "@/server/lib/env"
import { handle, ok, parseJson } from "@/server/lib/http"
import { requireTenant } from "@/server/services/tenant"
import { setVerificationStatus } from "@/server/services/verification"

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
    const body = await parseJson(req, schema)
    const jar = await cookies()

    if (body.action === "reset") {
      await rm(path.resolve(env.UPLOAD_DIR), { recursive: true, force: true })
      jar.delete(DEMO_COOKIES.fault)
      return ok(await resetDatabase())
    }

    if (body.action === "fault") {
      if (body.value === EDemoFault.None) jar.delete(DEMO_COOKIES.fault)
      else jar.set(DEMO_COOKIES.fault, body.value, { path: "/", sameSite: "lax", httpOnly: true })
      return ok({ fault: body.value })
    }

    const tenant = await requireTenant(body.workspace)
    await setVerificationStatus(tenant.workspace.id, body.status)
    return ok({ status: body.status })
  },
  { faults: false },
)
