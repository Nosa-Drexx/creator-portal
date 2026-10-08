import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { vi } from "vitest"

// Each run gets a throwaway database and upload folder
const dir = mkdtempSync(path.join(tmpdir(), "creatorhub-test-"))
process.env.DATABASE_URL = `file:${path.join(dir, "test.db")}`
process.env.UPLOAD_DIR = path.join(dir, "uploads")
process.env.VERIFICATION_REVIEW_SECONDS = "3600"

export const cookieJar = new Map<string, string>()

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (cookieJar.has(name) ? { name, value: cookieJar.get(name)! } : undefined),
    set: (name: string, value: string) => cookieJar.set(name, value),
    delete: (name: string) => cookieJar.delete(name),
  }),
}))
