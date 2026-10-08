import { Errors } from "@/server/lib/errors"
import { handle } from "@/server/lib/http"
import { requireUser } from "@/server/lib/session"
import { avatarKey } from "@/server/services/profile"
import { openObject } from "@/server/storage"

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" }

/** Any signed-in user can see avatars (teammates appear in member lists) */
export const GET = handle(
  async (_req, ctx: RouteContext<"/api/avatars/[userId]/[file]">) => {
    await requireUser()
    const { userId, file } = await ctx.params
    if (!/^usr_[a-z0-9_]+$/i.test(userId) || !/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(file)) throw Errors.notFound("Avatar")
    const object = await openObject(avatarKey(userId, file))
    if (!object) throw Errors.notFound("Avatar")
    return new Response(object.stream, {
      headers: {
        "Content-Type": TYPES[file.split(".").pop() ?? ""] ?? "application/octet-stream",
        "Content-Length": String(object.size),
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    })
  },
  { faults: false },
)
