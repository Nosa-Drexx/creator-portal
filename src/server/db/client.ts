import "server-only"

import { mkdirSync } from "node:fs"
import path from "node:path"
import { createClient, type Client } from "@libsql/client"
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql"
import { env } from "@/server/lib/env"
import * as schema from "./schema"

export type Database = LibSQLDatabase<typeof schema>

const globalForDb = globalThis as unknown as { libsql?: Client }

const SUPPORTED_SCHEMES = ["libsql:", "https:", "http:", "wss:", "ws:", "file:"]

/** Validates the URL without echoing it, since it can embed credentials */
function assertValidDatabaseUrl(url: string) {
  let scheme: string | undefined
  try {
    scheme = new URL(url).protocol
  } catch {}
  if (scheme && SUPPORTED_SCHEMES.includes(scheme)) return
  throw new Error(
    "DATABASE_URL is not a valid libSQL URL. Expected libsql://<db-name>-<org>.turso.io " +
      '(https://, wss:// and file: also work). Check the value for quotes, spaces or a "DATABASE_URL=" prefix.',
  )
}

function createLibsqlClient() {
  const url = env.DATABASE_URL
  assertValidDatabaseUrl(url)
  if (url.startsWith("file:")) {
    mkdirSync(path.dirname(url.replace("file:", "")), { recursive: true })
  }
  return createClient({ url, authToken: env.DATABASE_AUTH_TOKEN })
}

let libsql: Client | undefined
let instance: Database | undefined

/** Connects on first use, so importing this module (e.g. during `next build`) never opens a connection */
export function getLibsql(): Client {
  // Reuse one connection across hot reloads
  libsql ??= globalForDb.libsql ?? createLibsqlClient()
  if (process.env.NODE_ENV !== "production") globalForDb.libsql = libsql
  return libsql
}

/** The Drizzle wrapper is per module instance so schema edits apply on hot reload */
export function getDb(): Database {
  instance ??= drizzle(getLibsql(), { schema })
  return instance
}

/** Lazy stand-in for the Drizzle instance; resolves the real one on first property access */
export const db = new Proxy({} as Database, {
  get(_, prop) {
    const real = getDb()
    const value: unknown = Reflect.get(real, prop, real)
    return typeof value === "function" ? value.bind(real) : value
  },
  has: (_, prop) => Reflect.has(getDb(), prop),
})
