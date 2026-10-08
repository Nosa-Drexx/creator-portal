import "server-only"

import { mkdirSync } from "node:fs"
import path from "node:path"
import { createClient, type Client } from "@libsql/client"
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql"
import { env } from "@/server/lib/env"
import * as schema from "./schema"

export type Database = LibSQLDatabase<typeof schema>

const globalForDb = globalThis as unknown as { libsql?: Client; db?: Database }

function createLibsqlClient() {
  const url = env.DATABASE_URL
  if (url.startsWith("file:")) {
    mkdirSync(path.dirname(url.replace("file:", "")), { recursive: true })
  }
  return createClient({ url, authToken: env.DATABASE_AUTH_TOKEN })
}

// Reuse one connection across hot reloads in dev
export const libsql = globalForDb.libsql ?? createLibsqlClient()
export const db: Database = globalForDb.db ?? drizzle(libsql, { schema })

if (process.env.NODE_ENV !== "production") {
  globalForDb.libsql = libsql
  globalForDb.db = db
}
