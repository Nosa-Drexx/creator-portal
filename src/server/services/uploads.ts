import "server-only"

import { randomUUID } from "node:crypto"
import path from "node:path"
import { and, eq } from "drizzle-orm"
import { UPLOAD_RULES, validateUploadFile } from "@/constants/uploads"
import type { EUploadKind } from "@/enums/uploads"
import { db } from "@/server/db/client"
import { uploads } from "@/server/db/schema"
import { Errors } from "@/server/lib/errors"
import { newId } from "@/server/lib/ids"
import { writeObject } from "@/server/storage/local"
import { signUrl } from "@/server/storage/signing"
import type { UploadIntent, UploadIntentPayload } from "@/types/uploads"
import type { TenantContext } from "./tenant"

const UPLOAD_URL_TTL = 15 * 60
const MEDIA_URL_TTL = 10 * 60

/** Step 1: validate the file and hand back a short-lived signed PUT URL */
export async function createUploadIntent(ctx: TenantContext, payload: UploadIntentPayload): Promise<UploadIntent> {
  const error = validateUploadFile(payload.kind, { type: payload.contentType, size: payload.sizeBytes })
  if (error) throw Errors.badRequest(error)

  const ext = path.extname(payload.fileName).toLowerCase().replace(/[^.a-z0-9]/g, "")
  const key = `${ctx.workspace.id}/${payload.kind}/${randomUUID()}${ext}`

  await db.insert(uploads).values({
    id: newId("upl"),
    workspaceId: ctx.workspace.id,
    key,
    kind: payload.kind,
    fileName: payload.fileName,
    contentType: payload.contentType,
    sizeBytes: payload.sizeBytes,
  })

  const { url, expiresAt } = signUrl("/api/uploads", "put", key, UPLOAD_URL_TTL)
  return {
    key,
    uploadUrl: url,
    method: "PUT",
    headers: { "Content-Type": payload.contentType },
    expiresAt: expiresAt.toISOString(),
  }
}

/** Step 2: the signed PUT lands here (in production this would be the bucket itself) */
export async function receiveUpload(key: string, body: ReadableStream<Uint8Array> | null) {
  const upload = await db.query.uploads.findFirst({ where: eq(uploads.key, key) })
  if (!upload) throw Errors.notFound("Upload")
  if (upload.status === "complete") throw Errors.conflict("This file has already been uploaded")
  if (!body) throw Errors.badRequest("Missing file body")

  const limit = Math.min(upload.sizeBytes, UPLOAD_RULES[upload.kind as EUploadKind].maxBytes)
  const written = await writeObject(key, body, limit)
  if (written !== upload.sizeBytes) throw Errors.badRequest("Upload was incomplete. Please try again.")

  await db.update(uploads).set({ status: "complete", updatedAt: new Date() }).where(eq(uploads.id, upload.id))
  return { key, sizeBytes: written }
}

/** Short-lived playback/preview URLs, only for keys inside the caller's workspace */
export async function signMediaKeys(ctx: TenantContext, keys: string[]) {
  const unique = [...new Set(keys)]
  const result: Record<string, string> = {}

  for (const key of unique) {
    if (key.startsWith("/")) {
      result[key] = key
      continue
    }
    if (!key.startsWith(`${ctx.workspace.id}/`)) throw Errors.notFound("File")
    const owned = await db.query.uploads.findFirst({
      where: and(eq(uploads.key, key), eq(uploads.workspaceId, ctx.workspace.id), eq(uploads.status, "complete")),
    })
    if (!owned) throw Errors.notFound("File")
    result[key] = signUrl("/api/media", "get", key, MEDIA_URL_TTL).url
  }

  return { urls: result, ttlSeconds: MEDIA_URL_TTL }
}

export async function findUploadByKey(key: string) {
  return db.query.uploads.findFirst({ where: eq(uploads.key, key) })
}
