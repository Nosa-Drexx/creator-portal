import { beforeEach, describe, expect, it } from "vitest"
import { POST as createContent } from "@/app/api/workspaces/[slug]/content/route"
import { PUT as updateContent } from "@/app/api/workspaces/[slug]/content/[id]/route"
import { EContentStatus } from "@/enums/content"
import { EErrorCode } from "@/enums/errors"
import { EVerificationStatus } from "@/enums/verification"
import { resetDatabase } from "@/server/db/setup"
import { setVerificationStatus } from "@/server/services/verification"
import { ctx, json, req } from "../support/request"

const UNVERIFIED = "wild-frames"
const payload = (status: EContentStatus) => ({
  title: "Dolomites hut-to-hut",
  description: "",
  priceCents: 1200,
  thumbnailKey: "/seed/thumbnails/thumb-15.jpg",
  videoKey: "/seed/videos/sample-reel.mp4",
  status,
  scheduledFor: null,
})

const create = (slug: string, status: EContentStatus) =>
  createContent(req(`/api/workspaces/${slug}/content`, { method: "POST", body: payload(status) }), ctx({ slug }))

describe("POST/PUT content enforces the publishing rule", () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  it("rejects publishing from an unverified workspace with 403", async () => {
    const res = await create(UNVERIFIED, EContentStatus.Published)
    expect(res.status).toBe(403)
    expect((await json(res)).error.code).toBe(EErrorCode.VerificationRequired)
  })

  it("rejects scheduling from an unverified workspace", async () => {
    const body = { ...payload(EContentStatus.Scheduled), scheduledFor: new Date(Date.now() + 86_400_000).toISOString() }
    const res = await createContent(
      req(`/api/workspaces/${UNVERIFIED}/content`, { method: "POST", body }),
      ctx({ slug: UNVERIFIED }),
    )
    expect(res.status).toBe(403)
  })

  it("still lets unverified creators save drafts", async () => {
    const res = await create(UNVERIFIED, EContentStatus.Draft)
    expect(res.status).toBe(201)
  })

  it("blocks promoting an existing draft to published", async () => {
    const { data } = await json(await create(UNVERIFIED, EContentStatus.Draft))
    const res = await updateContent(
      req(`/api/workspaces/${UNVERIFIED}/content/${data.id}`, { method: "PUT", body: payload(EContentStatus.Published) }),
      ctx({ slug: UNVERIFIED, id: data.id }),
    )
    expect(res.status).toBe(403)
  })

  it("treats a pending review as not yet verified", async () => {
    await setVerificationStatus("ws_wild_frames", EVerificationStatus.Pending)
    const res = await create(UNVERIFIED, EContentStatus.Published)
    expect(res.status).toBe(403)
  })

  it("allows publishing once the workspace is verified", async () => {
    await setVerificationStatus("ws_wild_frames", EVerificationStatus.Verified)
    const res = await create(UNVERIFIED, EContentStatus.Published)
    expect(res.status).toBe(201)
    expect((await json(res)).data.status).toBe(EContentStatus.Published)
  })
})
