import "server-only"

import { rm } from "node:fs/promises"
import path from "node:path"
import { env } from "@/server/lib/env"
import { Errors } from "@/server/lib/errors"
import { blobClear, blobMediaUrl, blobOpen, blobSize, blobUploadTarget, blobWrite } from "./blob"
import { readObject, statObject, writeObject } from "./local"
import { signUrl } from "./signing"

/**
 * Vercel Blob when a store is connected (production), local disk otherwise.
 * Callers never branch on the driver; only the URLs they hand out differ.
 */
export const usesBlobStorage = Boolean(env.BLOB_READ_WRITE_TOKEN)

export async function createUploadTarget(key: string, contentType: string, sizeBytes: number, ttlSeconds: number) {
  if (usesBlobStorage) return blobUploadTarget(key, contentType, sizeBytes, ttlSeconds)
  const { url, expiresAt } = signUrl("/api/uploads", "put", key, ttlSeconds)
  return { url, expiresAt, headers: { "Content-Type": contentType } }
}

export async function mediaUrl(key: string, ttlSeconds: number) {
  if (usesBlobStorage) return blobMediaUrl(key, ttlSeconds)
  return signUrl("/api/media", "get", key, ttlSeconds).url
}

/** Size of a stored object, or null when it was never uploaded */
export async function objectSize(key: string) {
  if (usesBlobStorage) return blobSize(key)
  return (await statObject(key))?.size ?? null
}

/** Server-side writes (small files like avatars); enforces the size limit before storing */
export async function saveObject(key: string, body: ReadableStream<Uint8Array>, maxBytes: number, contentType: string) {
  if (!usesBlobStorage) return writeObject(key, body, maxBytes)
  const chunks: Uint8Array[] = []
  let size = 0
  for await (const chunk of body as unknown as AsyncIterable<Uint8Array>) {
    size += chunk.length
    if (size > maxBytes) throw Errors.badRequest("File is too large")
    chunks.push(chunk)
  }
  await blobWrite(key, Buffer.concat(chunks), contentType)
  return size
}

export async function openObject(key: string) {
  if (usesBlobStorage) return blobOpen(key)
  const stat = await statObject(key)
  return stat ? { stream: readObject(key), size: stat.size } : null
}

const APP_KEY = /^(avatars\/|[a-z]+_[a-z0-9_]+\/(thumbnail|video|document|selfie)\/)/

export async function clearObjects() {
  if (usesBlobStorage) return blobClear((pathname) => APP_KEY.test(pathname))
  await rm(path.resolve(env.UPLOAD_DIR), { recursive: true, force: true })
}
