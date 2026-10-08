import "server-only"

import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto"
import { env } from "./env"

// Separate key per purpose, derived from the app secret
const key = (purpose: string) => createHmac("sha256", env.MEDIA_SIGNING_SECRET).update(purpose).digest()

export function encrypt(plain: string, purpose: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", key(purpose), iv)
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64url")).join(".")
}

export function decrypt(payload: string, purpose: string) {
  const [iv, tag, data] = payload.split(".").map((p) => Buffer.from(p, "base64url"))
  const decipher = createDecipheriv("aes-256-gcm", key(purpose), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8")
}
