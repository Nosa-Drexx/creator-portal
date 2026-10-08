import { NextRequest } from "next/server"

const BASE = "http://localhost:3000"

export function req(path: string, init?: { method?: string; body?: unknown }) {
  return new NextRequest(`${BASE}${path}`, {
    method: init?.method ?? "GET",
    headers: { "content-type": "application/json" },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ctx = (params: Record<string, string | string[]>): any => ({ params: Promise.resolve(params) })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function json<T = any>(res: Response) {
  return (await res.json()) as T
}

/** Creates a real session row and sets the (mocked) cookie, like a login would */
export async function signInAs(userId: string) {
  const { createSession } = await import("@/server/auth/sessions")
  await createSession(userId, "vitest")
}
