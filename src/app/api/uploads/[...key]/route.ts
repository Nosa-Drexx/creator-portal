import { EErrorCode } from "@/enums/errors"
import { AppError } from "@/server/lib/errors"
import { handle, ok } from "@/server/lib/http"
import { keyFrom } from "@/server/lib/route-context"
import { verifySignature } from "@/server/storage/signing"
import { receiveUpload } from "@/server/services/uploads"

/** Local stand-in for a presigned object-storage PUT: the URL itself is the credential */
export const PUT = handle(
  async (req, ctx: RouteContext<"/api/uploads/[...key]">) => {
    const key = await keyFrom(ctx)
    if (!verifySignature("put", key, req.nextUrl.searchParams)) {
      throw new AppError(EErrorCode.Forbidden, 403, "This upload link has expired. Please try again.")
    }
    return ok(await receiveUpload(key, req.body))
  },
  { faults: false },
)
