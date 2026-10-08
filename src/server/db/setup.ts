import "server-only"

import path from "node:path"
import { count, eq } from "drizzle-orm"
import { migrate } from "drizzle-orm/libsql/migrator"
import { env } from "@/server/lib/env"
import { db, libsql } from "./client"
import { users, workspaces } from "./schema"
import { seedDatabase } from "./seed"

const MIGRATIONS_DIR = path.join(process.cwd(), "src/server/db/migrations")

// Shared across module instances (each route can load its own copy in dev)
const globalForSetup = globalThis as unknown as { dbReady?: Promise<void> | null }

/** Pre-release schemas (before roles) can't be migrated in place; rebuild them, since all data is demo data */
async function dropPreReleaseSchema() {
  const columns = await libsql.execute("PRAGMA table_info(memberships)")
  const isLegacy = columns.rows.length > 0 && !columns.rows.some((c) => c.name === "role_id")
  if (!isLegacy) return
  const tables = await libsql.execute("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
  await libsql.execute("PRAGMA foreign_keys = OFF")
  for (const { name } of tables.rows) await libsql.execute(`DROP TABLE IF EXISTS "${String(name)}"`)
  await libsql.execute("PRAGMA foreign_keys = ON")
}

async function setup() {
  await dropPreReleaseSchema()
  await migrate(db, { migrationsFolder: MIGRATIONS_DIR })
  if (!env.AUTO_SEED) return
  const [{ total }] = await db.select({ total: count() }).from(workspaces)
  // Databases created before auth have users without passwords; refresh the demo data
  const [{ legacy }] = await db.select({ legacy: count() }).from(users).where(eq(users.passwordHash, ""))
  if (total === 0 || legacy > 0) await seedDatabase(db)
}

/** Migrates and seeds on first use so `pnpm dev` works on a fresh clone */
export function ensureDatabase() {
  globalForSetup.dbReady ??= setup().catch((error) => {
    globalForSetup.dbReady = null
    throw error
  })
  return globalForSetup.dbReady
}

export async function resetDatabase() {
  await dropPreReleaseSchema()
  await migrate(db, { migrationsFolder: MIGRATIONS_DIR })
  return seedDatabase(db)
}
