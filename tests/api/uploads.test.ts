import { NextRequest } from "next/server"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"
import { PUT as receiveUpload } from "@/app/api/uploads/[...key]/route"
import { POST as completeUpload } from "@/app/api/workspaces/[slug]/uploads/complete/route"
import { POST as createUpload } from "@/app/api/workspaces/[slug]/uploads/route"
import { resetDatabase } from "@/server/db/setup"
import { cookieJar } from "../support/setup"
import { ctx, json, req, signInAs } from "../support/request"

const BYTES = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])

async function newIntent() {
  const res = await createUpload(
    req("/api/workspaces/amara-studio/uploads", {
      method: "POST",
      body: { kind: "thumbnail", fileName: "a.png", contentType: "image/png", sizeBytes: BYTES.length },
    }),
    ctx({ slug: "amara-studio" }),
  )
  return (await json(res)).data as { key: string; uploadUrl: string }
}

const complete = (slug: string, key: string) =>
  completeUpload(req(`/api/workspaces/${slug}/uploads/complete`, { method: "POST", body: { key } }), ctx({ slug }))

describe("upload completion", () => {
  beforeAll(async () => {
    await resetDatabase()
  })
  beforeEach(async () => {
    cookieJar.clear()
    await signInAs("usr_demo_amara")
  })

  it("rejects a key whose file never arrived", async () => {
    const { key } = await newIntent()
    expect((await complete("amara-studio", key)).status).toBe(400)
  })

  it("confirms a finished upload, and confirming again is harmless", async () => {
    const { key, uploadUrl } = await newIntent()
    const put = await receiveUpload(
      new NextRequest(`http://localhost:3000${uploadUrl}`, { method: "PUT", body: BYTES }),
      ctx({ key: key.split("/") }),
    )
    expect(put.status).toBe(200)
    expect((await complete("amara-studio", key)).status).toBe(200)
    expect((await complete("amara-studio", key)).status).toBe(200)
  })

  it("can't confirm an upload from another workspace", async () => {
    const { key } = await newIntent()
    expect((await complete("wild-frames", key)).status).toBe(404)
  })
})
