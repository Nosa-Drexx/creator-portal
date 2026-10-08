import "server-only"

import path from "node:path"
import { count, eq } from "drizzle-orm"
import { migrate } from "drizzle-orm/libsql/migrator"
import { env } from "@/server/lib/env"
import { db } from "./client"
import { users, workspaces } from "./schema"
import { seedDatabase } from "./seed"

const MIGRATIONS_DIR = path.join(process.cwd(), "src/server/db/migrations")

// Shared across module instances (each route can load its own copy in dev)
const globalForSetup = globalThis as unknown as { dbReady?: Promise<void> | null }

async function setup() {
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
  await migrate(db, { migrationsFolder: MIGRATIONS_DIR })
  return seedDatabase(db)
}
