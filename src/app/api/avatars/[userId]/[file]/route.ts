import { Errors } from "@/server/lib/errors"
import { handle } from "@/server/lib/http"
import { requireUser } from "@/server/lib/session"
import { avatarKey } from "@/server/services/profile"
import { readObject, statObject } from "@/server/storage/local"

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" }

/** Any signed-in user can see avatars (teammates appear in member lists) */
export const GET = handle(
  async (_req, ctx: RouteContext<"/api/avatars/[userId]/[file]">) => {
    await requireUser()
    const { userId, file } = await ctx.params
    if (!/^usr_[a-z0-9_]+$/i.test(userId) || !/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(file)) throw Errors.notFound("Avatar")
    const key = avatarKey(userId, file)
    const stat = await statObject(key)
    if (!stat) throw Errors.notFound("Avatar")
    return new Response(readObject(key), {
      headers: {
        "Content-Type": TYPES[file.split(".").pop() ?? ""] ?? "application/octet-stream",
        "Content-Length": String(stat.size),
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    })
  },
  { faults: false },
)
