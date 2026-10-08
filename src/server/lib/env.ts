import "server-only"

import { z } from "zod"

// Serverless filesystems are read-only outside /tmp, so fall back there on Vercel
const localDir = process.env.VERCEL ? "/tmp/creatorhub" : ".data"

/** Forgives copy-paste slips (whitespace, wrapping quotes, a leading `NAME=`) and reads the first set name */
function pasted(...names: string[]) {
  for (const name of names) {
    let v = process.env[name]?.trim() ?? ""
    for (const prefix of names) if (v.startsWith(`${prefix}=`)) v = v.slice(prefix.length + 1).trim()
    v = v.replace(/^(["'`])([\s\S]*)\1$/, "$2").trim()
    if (v) return v
  }
  return undefined
}

const schema = z.object({
  // Scheme is validated on first DB use (see db/client.ts) so a bad value never breaks the build
  DATABASE_URL: z.string().default(`file:${localDir}/creatorhub.db`),
  DATABASE_AUTH_TOKEN: z.string().optional(),
  MEDIA_SIGNING_SECRET: z.string().min(16).default("local-dev-only-media-signing-secret"),
  UPLOAD_DIR: z.string().default(`${localDir}/uploads`),
  // Set by connecting a Vercel Blob store; without it uploads stay on local disk
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  AUTO_SEED: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  VERIFICATION_REVIEW_SECONDS: z.coerce.number().int().min(0).default(20),
})

// The Vercel Turso integration provides TURSO_* names; explicit DATABASE_* values win
export const env = schema.parse({
  ...process.env,
  DATABASE_URL: pasted("DATABASE_URL", "TURSO_DATABASE_URL"),
  DATABASE_AUTH_TOKEN: pasted("DATABASE_AUTH_TOKEN", "TURSO_AUTH_TOKEN"),
  BLOB_READ_WRITE_TOKEN: pasted("BLOB_READ_WRITE_TOKEN"),
})
