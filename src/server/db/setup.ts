import "server-only"

import path from "node:path"
import { count } from "drizzle-orm"
import { migrate } from "drizzle-orm/libsql/migrator"
import { env } from "@/server/lib/env"
import { db } from "./client"
import { workspaces } from "./schema"
import { seedDatabase } from "./seed"

const MIGRATIONS_DIR = path.join(process.cwd(), "src/server/db/migrations")

let ready: Promise<void> | null = null

async function setup() {
  await migrate(db, { migrationsFolder: MIGRATIONS_DIR })
  if (!env.AUTO_SEED) return
  const [{ total }] = await db.select({ total: count() }).from(workspaces)
  if (total === 0) await seedDatabase(db)
}

/** Migrates and seeds on first use so `pnpm dev` works on a fresh clone */
export function ensureDatabase() {
  ready ??= setup().catch((error) => {
    ready = null
    throw error
  })
  return ready
}

export async function resetDatabase() {
  await migrate(db, { migrationsFolder: MIGRATIONS_DIR })
  return seedDatabase(db)
}
