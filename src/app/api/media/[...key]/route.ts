import { EErrorCode } from "@/enums/errors"
import { AppError, Errors } from "@/server/lib/errors"
import { handle } from "@/server/lib/http"
import { keyFrom } from "@/server/lib/route-context"
import { readObject, statObject } from "@/server/storage/local"
import { verifySignature } from "@/server/storage/signing"
import { findUploadByKey } from "@/server/services/uploads"

function parseRange(header: string | null, size: number) {
  const match = header?.match(/bytes=(\d*)-(\d*)/)
  if (!match) return null
  const start = match[1] ? Number(match[1]) : size - Number(match[2])
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1
  return start >= 0 && start <= end ? { start, end } : null
}

export const GET = handle(
  async (req, ctx: RouteContext<"/api/media/[...key]">) => {
    const key = await keyFrom(ctx)
    if (!verifySignature("get", key, req.nextUrl.searchParams)) {
      throw new AppError(EErrorCode.Forbidden, 403, "This media link has expired")
    }
    const [file, upload] = await Promise.all([statObject(key), findUploadByKey(key)])
    if (!file || !upload) throw Errors.notFound("File")

    const headers = new Headers({
      "Content-Type": upload.contentType,
      "Accept-Ranges": "bytes",
      // Private: signed URLs must not be cached by shared caches
      "Cache-Control": "private, max-age=600",
    })
    const range = parseRange(req.headers.get("range"), file.size)

    if (range) {
      headers.set("Content-Range", `bytes ${range.start}-${range.end}/${file.size}`)
      headers.set("Content-Length", String(range.end - range.start + 1))
      return new Response(readObject(key, range), { status: 206, headers })
    }
    headers.set("Content-Length", String(file.size))
    return new Response(readObject(key), { status: 200, headers })
  },
  { faults: false },
)
