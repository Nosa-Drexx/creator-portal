import { beforeAll, describe, expect, it } from "vitest"
import { POST as createWorkspace } from "@/app/api/workspaces/route"
import { POST as createContent } from "@/app/api/workspaces/[slug]/content/route"
import { GET as getSession } from "@/app/api/session/route"
import { resetDatabase } from "@/server/db/setup"
import { ctx, json, req } from "../support/request"

const create = (body: unknown) => createWorkspace(req("/api/workspaces", { method: "POST", body }), ctx({}))

describe("POST /api/workspaces", () => {
  beforeAll(async () => {
    await resetDatabase()
  })

  it("creates a workspace owned by the caller that starts unverified", async () => {
    const res = await create({ name: "Kitchen Table Sessions", handle: "kitchentable", accentColor: "#8b5cf6" })
    expect(res.status).toBe(201)
    const { data } = await json(res)
    expect(data).toMatchObject({ slug: "kitchen-table-sessions", handle: "@kitchentable", role: "owner", canPublish: false })

    const session = await json(await getSession(req("/api/session"), ctx({})))
    expect(session.data.workspaces.map((w: { slug: string }) => w.slug)).toContain("kitchen-table-sessions")
  })

  it("gives colliding names a unique slug", async () => {
    const { data } = await json(await create({ name: "Kitchen Table Sessions", handle: "kts2", accentColor: "#8b5cf6" }))
    expect(data.slug).toBe("kitchen-table-sessions-2")
  })

  it("applies the publishing rule to new workspaces too", async () => {
    const res = await createContent(
      req("/api/workspaces/kitchen-table-sessions/content", {
        method: "POST",
        body: {
          title: "First video",
          description: "",
          priceCents: 500,
          thumbnailKey: "/seed/thumbnails/thumb-01.jpg",
          videoKey: "/seed/videos/sample-reel.mp4",
          status: "published",
          scheduledFor: null,
        },
      }),
      ctx({ slug: "kitchen-table-sessions" }),
    )
    expect(res.status).toBe(403)
  })

  it("validates input", async () => {
    const res = await create({ name: "x", handle: "no spaces", accentColor: "#123456" })
    expect(res.status).toBe(422)
    expect(Object.keys((await json(res)).error.fieldErrors).sort()).toEqual(["accentColor", "handle", "name"])
  })
})
