import { beforeEach, describe, expect, it } from "vitest"
import { GET as overview } from "@/app/api/workspaces/[slug]/analytics/overview/route"
import { DELETE as deleteContent } from "@/app/api/workspaces/[slug]/content/[id]/route"
import { GET as listContent, POST as createContent } from "@/app/api/workspaces/[slug]/content/route"
import { POST as invite } from "@/app/api/workspaces/[slug]/invitations/route"
import { DELETE as removeMember, PATCH as changeRole } from "@/app/api/workspaces/[slug]/members/[memberId]/route"
import { GET as listMembers } from "@/app/api/workspaces/[slug]/members/route"
import { GET as purchases } from "@/app/api/workspaces/[slug]/purchases/route"
import { DELETE as deleteRole, PUT as updateRole } from "@/app/api/workspaces/[slug]/roles/[roleId]/route"
import { POST as createRole } from "@/app/api/workspaces/[slug]/roles/route"
import { POST as submitVerification } from "@/app/api/workspaces/[slug]/verification/route"
import { EErrorCode } from "@/enums/errors"
import { resetDatabase } from "@/server/db/setup"
import { cookieJar } from "../support/setup"
import { ctx, json, req, signInAs } from "../support/request"

const slug = "amara-studio"
const as = async (who: "amara" | "jordan" | "priya" | "sam") => {
  cookieJar.clear()
  await signInAs(`usr_demo_${who}`)
}
const draft = (status = "draft") => ({
  title: "Team upload",
  description: "",
  priceCents: 900,
  thumbnailKey: "/seed/thumbnails/thumb-01.jpg",
  videoKey: "/seed/videos/sample-reel.mp4",
  status,
  scheduledFor: null,
})
const post = (handler: (r: never, c: never) => Promise<Response>, path: string, body: unknown, params: Record<string, string> = {}) =>
  handler(req(path, { method: "POST", body }) as never, ctx({ slug, ...params }) as never)

describe("role-based permissions", () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  it("editor: can draft, but can't publish, delete, or see sales", async () => {
    await as("priya")
    expect((await post(createContent, `/api/workspaces/${slug}/content`, draft())).status).toBe(201)
    const publish = await post(createContent, `/api/workspaces/${slug}/content`, draft("published"))
    expect(publish.status).toBe(403)
    expect((await json(publish)).error.code).toBe(EErrorCode.Forbidden)
    expect((await deleteContent(req("/x", { method: "DELETE" }), ctx({ slug, id: "cnt_studio_12" }))).status).toBe(403)
    expect((await purchases(req(`/api/workspaces/${slug}/purchases`), ctx({ slug }))).status).toBe(403)
    expect((await overview(req("/x"), ctx({ slug }))).status).toBe(403)
  })

  it("hides revenue and views from roles without analytics", async () => {
    await as("priya")
    const { data } = await json(await listContent(req(`/api/workspaces/${slug}/content`), ctx({ slug })))
    expect(data.every((c: { revenueCents: number | null }) => c.revenueCents === null)).toBe(true)
    await as("sam")
    const { data: analystView } = await json(await listContent(req(`/api/workspaces/${slug}/content`), ctx({ slug })))
    expect(analystView.some((c: { revenueCents: number | null }) => (c.revenueCents ?? 0) > 0)).toBe(true)
  })

  it("analyst: read-only", async () => {
    await as("sam")
    expect((await purchases(req(`/api/workspaces/${slug}/purchases`), ctx({ slug }))).status).toBe(200)
    expect((await post(createContent, `/api/workspaces/${slug}/content`, draft())).status).toBe(403)
    expect((await post(invite, `/api/workspaces/${slug}/invitations`, { email: "x@example.com", roleId: "rol_studio_editor" })).status).toBe(403)
  })

  it("admin: manages the team but can't grant ownership, submit verification, or escalate", async () => {
    await as("jordan")
    expect((await post(invite, `/api/workspaces/${slug}/invitations`, { email: "new@example.com", roleId: "rol_studio_editor" })).status).toBe(201)
    expect((await post(invite, `/api/workspaces/${slug}/invitations`, { email: "boss@example.com", roleId: "rol_studio_owner" })).status).toBe(403)
    expect((await post(submitVerification, `/api/workspaces/${slug}/verification`, {})).status).toBe(403)
    const escalate = await post(createRole, `/api/workspaces/${slug}/roles`, { name: "Sneaky", permissions: ["manage:verification"] })
    expect(escalate.status).toBe(403)
  })

  it("protects the last owner", async () => {
    await as("amara")
    const demote = await changeRole(req("/x", { method: "PATCH", body: { roleId: "rol_studio_editor" } }), ctx({ slug, memberId: "mem_amara_studio" }))
    expect(demote.status).toBe(409)
    expect((await removeMember(req("/x", { method: "DELETE" }), ctx({ slug, memberId: "mem_amara_studio" }))).status).toBe(409)
  })

  it("lets anyone leave, and members see the team list", async () => {
    await as("sam")
    expect((await listMembers(req("/x"), ctx({ slug }))).status).toBe(200)
    expect((await removeMember(req("/x", { method: "DELETE" }), ctx({ slug, memberId: "mem_sam_studio" }))).status).toBe(200)
    expect((await listMembers(req("/x"), ctx({ slug }))).status).toBe(404)
  })

  it("custom roles: built-ins are locked, names are unique, in-use roles can't be deleted", async () => {
    await as("amara")
    const body = { name: "Owner", permissions: ["view:content"] }
    expect((await updateRole(req("/x", { method: "PUT", body }), ctx({ slug, roleId: "rol_studio_owner" }))).status).toBe(403)
    expect((await post(createRole, `/api/workspaces/${slug}/roles`, body)).status).toBe(409)
    const created = await json(await post(createRole, `/api/workspaces/${slug}/roles`, { name: "Reviewer", permissions: ["view:content"] }))
    expect((await deleteRole(req("/x", { method: "DELETE" }), ctx({ slug, roleId: created.data.id }))).status).toBe(200)
    await changeRole(req("/x", { method: "PATCH", body: { roleId: "rol_studio_producer" } }), ctx({ slug, memberId: "mem_priya_studio" }))
    expect((await deleteRole(req("/x", { method: "DELETE" }), ctx({ slug, roleId: "rol_studio_producer" }))).status).toBe(409)
  })

  it("a role change takes effect on the next request", async () => {
    await as("amara")
    await changeRole(req("/x", { method: "PATCH", body: { roleId: "rol_studio_producer" } }), ctx({ slug, memberId: "mem_priya_studio" }))
    await as("priya")
    expect((await post(createContent, `/api/workspaces/${slug}/content`, draft("published"))).status).toBe(201)
  })
})
