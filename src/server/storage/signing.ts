import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"
import { env } from "@/server/lib/env"

export type SignedOp = "get" | "put"

function signature(op: SignedOp, key: string, exp: number) {
  return createHmac("sha256", env.MEDIA_SIGNING_SECRET).update(`${op}:${key}:${exp}`).digest("base64url")
}

/** Short-lived HMAC URLs, the local stand-in for S3/CloudFront signed URLs */
export function signUrl(base: string, op: SignedOp, key: string, ttlSeconds: number) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds
  const path = key.split("/").map(encodeURIComponent).join("/")
  return {
    url: `${base}/${path}?exp=${exp}&sig=${signature(op, key, exp)}`,
    expiresAt: new Date(exp * 1000),
  }
}

export function verifySignature(op: SignedOp, key: string, params: URLSearchParams) {
  const exp = Number(params.get("exp"))
  const sig = params.get("sig") ?? ""
  if (!exp || exp < Date.now() / 1000) return false
  const expected = Buffer.from(signature(op, key, exp))
  const given = Buffer.from(sig)
  return expected.length === given.length && timingSafeEqual(expected, given)
}
