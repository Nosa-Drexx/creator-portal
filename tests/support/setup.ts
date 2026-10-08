import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { vi } from "vitest"

// Each run gets a throwaway database and upload folder
const dir = mkdtempSync(path.join(tmpdir(), "creatorhub-test-"))
process.env.DATABASE_URL = `file:${path.join(dir, "test.db")}`
process.env.UPLOAD_DIR = path.join(dir, "uploads")
process.env.VERIFICATION_REVIEW_SECONDS = "3600"
// Tests always use local disk, even if a Blob token is set in the shell
delete process.env.BLOB_READ_WRITE_TOKEN

export const cookieJar = new Map<string, string>()

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (cookieJar.has(name) ? { name, value: cookieJar.get(name)! } : undefined),
    set: (name: string, value: string) => cookieJar.set(name, value),
    delete: (name: string) => cookieJar.delete(name),
  }),
}))

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  connection: async () => {},
}))
