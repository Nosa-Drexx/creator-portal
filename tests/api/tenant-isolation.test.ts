import { beforeAll, beforeEach, describe, expect, it } from "vitest"
import { GET as getWorkspace } from "@/app/api/workspaces/[slug]/route"
import { GET as getContentItem } from "@/app/api/workspaces/[slug]/content/[id]/route"
import { GET as listPurchases } from "@/app/api/workspaces/[slug]/purchases/route"
import { POST as signMedia } from "@/app/api/workspaces/[slug]/media/sign/route"
import { POST as createUpload } from "@/app/api/workspaces/[slug]/uploads/route"
import { DEMO_COOKIES } from "@/constants/demo"
import { resetDatabase } from "@/server/db/setup"
import { cookieJar } from "../support/setup"
import { ctx, json, req } from "../support/request"

describe("tenant isolation", () => {
  beforeAll(async () => {
    await resetDatabase()
  })
  beforeEach(() => cookieJar.clear())

  it("returns 404 (not 403) for a workspace the user doesn't belong to", async () => {
    const res = await getWorkspace(req("/api/workspaces/northbound-films"), ctx({ slug: "northbound-films" }))
    expect(res.status).toBe(404)
  })

  it("can't read another workspace's content through your own slug", async () => {
    const res = await getContentItem(
      req("/api/workspaces/amara-studio/content/cnt_north_01"),
      ctx({ slug: "amara-studio", id: "cnt_north_01" }),
    )
    expect(res.status).toBe(404)
  })

  it("only lists purchases from the current workspace", async () => {
    const res = await listPurchases(req("/api/workspaces/amara-studio/purchases?limit=100"), ctx({ slug: "amara-studio" }))
    const { data } = await json(res)
    expect(data.meta.total).toBe(1223)
    expect(data.data.every((p: { id: string }) => p.id.startsWith("pur_studio_"))).toBe(true)
  })

  it("won't sign a media key from another workspace", async () => {
    const intent = await json(
      await createUpload(
        req("/api/workspaces/amara-studio/uploads", {
          method: "POST",
          body: { kind: "thumbnail", fileName: "a.jpg", contentType: "image/jpeg", sizeBytes: 10 },
        }),
        ctx({ slug: "amara-studio" }),
      ),
    )
    const res = await signMedia(
      req("/api/workspaces/wild-frames/media/sign", { method: "POST", body: { keys: [intent.data.key] } }),
      ctx({ slug: "wild-frames" }),
    )
    expect(res.status).toBe(404)
  })

  it("scopes access to the signed-in user", async () => {
    cookieJar.set(DEMO_COOKIES.session, "usr_demo_theo")
    const own = await getWorkspace(req("/api/workspaces/northbound-films"), ctx({ slug: "northbound-films" }))
    const other = await getWorkspace(req("/api/workspaces/amara-studio"), ctx({ slug: "amara-studio" }))
    expect(own.status).toBe(200)
    expect(other.status).toBe(404)
  })
})
