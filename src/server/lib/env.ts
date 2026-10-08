import "server-only"

import { z } from "zod"

// Serverless filesystems are read-only outside /tmp, so fall back there on Vercel
const localDir = process.env.VERCEL ? "/tmp/creatorhub" : ".data"

const schema = z.object({
  DATABASE_URL: z.string().default(`file:${localDir}/creatorhub.db`),
  DATABASE_AUTH_TOKEN: z.string().optional(),
  MEDIA_SIGNING_SECRET: z.string().min(16).default("local-dev-only-media-signing-secret"),
  UPLOAD_DIR: z.string().default(`${localDir}/uploads`),
  AUTO_SEED: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  VERIFICATION_REVIEW_SECONDS: z.coerce.number().int().min(0).default(20),
})

export const env = schema.parse(process.env)
