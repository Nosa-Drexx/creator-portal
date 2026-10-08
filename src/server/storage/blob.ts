import "server-only"

import {
  BlobNotFoundError,
  del,
  get,
  head,
  issueSignedToken,
  list,
  parseStoreIdFromDelegationToken,
  presignUrl,
  put,
  type IssuedSignedToken,
} from "@vercel/blob"
import { env } from "@/server/lib/env"

// Private store: every read goes through a short-lived presigned URL, like S3 + CloudFront
const access = "private" as const
const token = () => env.BLOB_READ_WRITE_TOKEN
// Headers the Blob API expects on a single-object PUT (mirrors the SDK's own client upload)
const API_VERSION = "12"

/** Presigned PUT the browser sends the file to directly, so large videos never pass through a function */
export async function blobUploadTarget(key: string, contentType: string, sizeBytes: number, ttlSeconds: number) {
  const validUntil = Date.now() + ttlSeconds * 1000
  const delegation = await issueSignedToken({ token: token(), pathname: key, operations: ["put"], validUntil })
  const { presignedUrl } = await presignUrl(delegation, {
    operation: "put",
    access,
    pathname: key,
    validUntil,
    allowedContentTypes: [contentType],
    maximumSizeInBytes: sizeBytes,
    addRandomSuffix: false,
    allowOverwrite: false,
  })
  return {
    url: presignedUrl,
    expiresAt: new Date(validUntil),
    headers: {
      "x-vercel-blob-store-id": parseStoreIdFromDelegationToken(delegation.delegationToken),
      "x-api-version": API_VERSION,
      "x-vercel-blob-access": access,
      "x-content-type": contentType,
    },
  }
}

// One store-wide read delegation per instance; each URL is still signed for a single path
let readDelegation: IssuedSignedToken | null = null

export async function blobMediaUrl(key: string, ttlSeconds: number) {
  const validUntil = Date.now() + ttlSeconds * 1000
  if (!readDelegation || readDelegation.validUntil < validUntil) {
    readDelegation = await issueSignedToken({
      token: token(),
      pathname: "*",
      operations: ["get"],
      validUntil: Date.now() + 60 * 60 * 1000,
    })
  }
  const { presignedUrl } = await presignUrl(readDelegation, { operation: "get", access, pathname: key, validUntil })
  return presignedUrl
}

export async function blobSize(key: string) {
  try {
    return (await head(key, { token: token() })).size
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null
    throw error
  }
}

export async function blobWrite(key: string, body: Buffer, contentType: string) {
  await put(key, body, { access, token: token(), contentType, addRandomSuffix: false, allowOverwrite: true })
}

export async function blobOpen(key: string) {
  const result = await get(key, { access, token: token() })
  if (!result || result.statusCode !== 200) return null
  return { stream: result.stream, size: result.blob.size }
}

/** Demo reset: removes only what this app writes (workspace media and avatars) */
export async function blobClear(isAppKey: (pathname: string) => boolean) {
  let cursor: string | undefined
  do {
    const page = await list({ token: token(), cursor, limit: 1000 })
    const urls = page.blobs.filter((b) => isAppKey(b.pathname)).map((b) => b.url)
    if (urls.length) await del(urls, { token: token() })
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)
}
