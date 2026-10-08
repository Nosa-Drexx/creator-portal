import "server-only"

import { randomUUID } from "node:crypto"
import path from "node:path"
import { and, eq } from "drizzle-orm"
import { UPLOAD_RULES, validateUploadFile } from "@/constants/uploads"
import { EUploadKind } from "@/enums/uploads"
import { db } from "@/server/db/client"
import { uploads } from "@/server/db/schema"
import { Errors } from "@/server/lib/errors"
import { newId } from "@/server/lib/ids"
import { createUploadTarget, mediaUrl, objectSize } from "@/server/storage"
import { writeObject } from "@/server/storage/local"
import type { UploadIntent, UploadIntentPayload } from "@/types/uploads"
import type { Permission } from "@/constants/permissions"
import { assertPermission, hasPermission } from "./permissions"
import type { TenantContext } from "./tenant"

const UPLOAD_URL_TTL = 15 * 60
const MEDIA_URL_TTL = 10 * 60

const UPLOAD_PERMISSIONS: Record<EUploadKind, Permission[]> = {
  // Editors replacing media on an existing video need uploads too
  [EUploadKind.Thumbnail]: ["create:content", "edit:content"],
  [EUploadKind.Video]: ["create:content", "edit:content"],
  [EUploadKind.Document]: ["manage:verification"],
  [EUploadKind.Selfie]: ["manage:verification"],
}

/** Step 1: validate the file and hand back a short-lived signed PUT URL */
export async function createUploadIntent(ctx: TenantContext, payload: UploadIntentPayload): Promise<UploadIntent> {
  const allowed = UPLOAD_PERMISSIONS[payload.kind]
  if (!allowed.some((code) => hasPermission(ctx.permissions, code))) assertPermission(ctx, allowed[0])
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

  const target = await createUploadTarget(key, payload.contentType, payload.sizeBytes, UPLOAD_URL_TTL)
  return {
    key,
    uploadUrl: target.url,
    method: "PUT",
    headers: target.headers,
    expiresAt: target.expiresAt.toISOString(),
  }
}

/** Step 2 on local disk: the signed PUT lands here (with Vercel Blob or S3 it goes to the bucket) */
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

/**
 * Step 3: the client confirms the PUT finished. Direct-to-storage uploads never touch the
 * API, so the stored size is checked before the key can be attached to anything.
 */
export async function completeUpload(ctx: TenantContext, key: string) {
  const upload = await db.query.uploads.findFirst({
    where: and(eq(uploads.key, key), eq(uploads.workspaceId, ctx.workspace.id)),
  })
  if (!upload) throw Errors.notFound("Upload")
  if (upload.status === "complete") return { key, sizeBytes: upload.sizeBytes }

  const stored = await objectSize(key)
  if (stored !== upload.sizeBytes) throw Errors.badRequest("Upload was incomplete. Please try again.")
  await db.update(uploads).set({ status: "complete", updatedAt: new Date() }).where(eq(uploads.id, upload.id))
  return { key, sizeBytes: stored }
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
    result[key] = await mediaUrl(key, MEDIA_URL_TTL)
  }

  return { urls: result, ttlSeconds: MEDIA_URL_TTL }
}

export async function findUploadByKey(key: string) {
  return db.query.uploads.findFirst({ where: eq(uploads.key, key) })
}
