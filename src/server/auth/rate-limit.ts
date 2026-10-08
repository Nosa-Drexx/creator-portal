import "server-only"

const WINDOW_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 8
const attempts = new Map<string, { count: number; resetAt: number }>()

/**
 * Per-process limiter for failed logins. Production would use Redis so the
 * limit holds across instances.
 */
export function isRateLimited(key: string) {
  const entry = attempts.get(key)
  return !!entry && entry.resetAt > Date.now() && entry.count >= MAX_ATTEMPTS
}

export function recordFailure(key: string) {
  const now = Date.now()
  const entry = attempts.get(key)
  if (!entry || entry.resetAt <= now) attempts.set(key, { count: 1, resetAt: now + WINDOW_MS })
  else entry.count += 1
}

export const clearFailures = (key: string) => attempts.delete(key)
