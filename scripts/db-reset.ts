import { rmSync } from "node:fs"
import path from "node:path"
import { resetDatabase } from "@/server/db/setup"
import { env } from "@/server/lib/env"

async function main() {
  rmSync(path.resolve(env.UPLOAD_DIR), { recursive: true, force: true })
  const started = Date.now()
  const result = await resetDatabase()
  console.log(`Database reset in ${Date.now() - started}ms`)
  console.table(result)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
