import { afterEach, describe, expect, it, vi } from "vitest"
import { signUrl, verifySignature } from "@/server/storage/signing"

const params = (url: string) => new URL(url, "http://x").searchParams

describe("signed media URLs", () => {
  afterEach(() => vi.useRealTimers())

  it("verifies a fresh URL for the same key and operation", () => {
    const { url } = signUrl("/api/media", "get", "ws_a/video/1.mp4", 60)
    expect(verifySignature("get", "ws_a/video/1.mp4", params(url))).toBe(true)
  })

  it("rejects a different key, operation or tampered signature", () => {
    const { url } = signUrl("/api/media", "get", "ws_a/video/1.mp4", 60)
    expect(verifySignature("get", "ws_b/video/1.mp4", params(url))).toBe(false)
    expect(verifySignature("put", "ws_a/video/1.mp4", params(url))).toBe(false)
    expect(verifySignature("get", "ws_a/video/1.mp4", params(url.replace(/sig=./, "sig=x")))).toBe(false)
  })

  it("expires", () => {
    const { url } = signUrl("/api/media", "get", "k", 60)
    vi.useFakeTimers()
    vi.setSystemTime(Date.now() + 61_000)
    expect(verifySignature("get", "k", params(url))).toBe(false)
  })
})
