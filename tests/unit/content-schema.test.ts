import { describe, expect, it } from "vitest"
import { EContentStatus } from "@/enums/content"
import { contentPayloadSchema } from "@/lib/validation/content"

const base = {
  title: "Golden hour",
  description: "",
  priceCents: 900,
  thumbnailKey: "/seed/thumbnails/thumb-01.jpg",
  videoKey: "/seed/videos/sample-reel.mp4",
  status: EContentStatus.Published,
  scheduledFor: null,
}

const issues = (input: unknown) =>
  contentPayloadSchema.safeParse(input).error?.issues.map((i) => i.path.join(".")) ?? []

describe("content payload validation", () => {
  it("accepts a complete published payload", () => {
    expect(issues(base)).toEqual([])
  })

  it("lets drafts skip media", () => {
    expect(issues({ ...base, status: EContentStatus.Draft, thumbnailKey: null, videoKey: null })).toEqual([])
  })

  it("requires media before publishing", () => {
    expect(issues({ ...base, thumbnailKey: null, videoKey: null })).toEqual(["thumbnailKey", "videoKey"])
  })

  it("requires a future date when scheduling", () => {
    const past = new Date(Date.now() - 60_000).toISOString()
    expect(issues({ ...base, status: EContentStatus.Scheduled, scheduledFor: past })).toEqual(["scheduledFor"])
  })

  it("rejects negative prices and short titles", () => {
    expect(issues({ ...base, priceCents: -1, title: "ab" })).toEqual(["title", "priceCents"])
  })
})
