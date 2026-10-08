import { beforeEach, describe, expect, it } from "vitest"
import { POST as acceptById } from "@/app/api/invitations/[id]/accept/route"
import { GET as myInvites } from "@/app/api/invitations/route"
import { POST as acceptByToken } from "@/app/api/invitations/token/[token]/route"
import { POST as signup } from "@/app/api/auth/signup/route"
import { DELETE as revoke } from "@/app/api/workspaces/[slug]/invitations/[invitationId]/route"
import { POST as invite } from "@/app/api/workspaces/[slug]/invitations/route"
import { GET as getWorkspace } from "@/app/api/workspaces/[slug]/route"
import { resetDatabase } from "@/server/db/setup"
import { cookieJar } from "../support/setup"
import { ctx, json, req, signInAs } from "../support/request"

const slug = "amara-studio"
const sendInvite = async (email: string) => {
  cookieJar.clear()
  await signInAs("usr_demo_amara")
  const res = await invite(req(`/api/workspaces/${slug}/invitations`, { method: "POST", body: { email, roleId: "rol_studio_editor" } }), ctx({ slug }))
  return (await json(res)).data as { invitation: { id: string }; inviteUrl: string }
}

describe("invitations", () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  it("shows seeded invites to the invitee and lets them accept", async () => {
    cookieJar.clear()
    await signInAs("usr_demo_theo")
    const { data } = await json(await myInvites(req("/api/invitations"), ctx({})))
    expect(data).toHaveLength(1)
    expect((await getWorkspace(req("/x"), ctx({ slug }))).status).toBe(404)
    await acceptById(req("/x", { method: "POST" }), ctx({ id: data[0].id }))
    const ws = await json(await getWorkspace(req("/x"), ctx({ slug })))
    expect(ws.data.role.name).toBe("Video Producer")
  })

  it("binds invite links to the invited email", async () => {
    const { inviteUrl } = await sendInvite("theo@creatorhub.dev")
    const token = inviteUrl.split("/").pop()!
    cookieJar.clear()
    await signInAs("usr_demo_sam")
    expect((await acceptByToken(req("/x", { method: "POST" }), ctx({ token }))).status).toBe(403)
    cookieJar.clear()
    await signInAs("usr_demo_theo")
    expect((await acceptByToken(req("/x", { method: "POST" }), ctx({ token }))).status).toBe(200)
  })

  it("lets a brand-new account accept an invite sent to its email", async () => {
    const { inviteUrl } = await sendInvite("newbie@example.com")
    cookieJar.clear()
    await signup(req("/api/auth/signup", { method: "POST", body: { name: "New Bie", email: "newbie@example.com", password: "s3cure-pass" } }), ctx({}))
    const res = await acceptByToken(req("/x", { method: "POST" }), ctx({ token: inviteUrl.split("/").pop()! }))
    expect((await json(res)).data.slug).toBe(slug)
  })

  it("revoked and re-sent invites invalidate old links", async () => {
    const first = await sendInvite("theo@creatorhub.dev")
    const second = await sendInvite("theo@creatorhub.dev")
    await revoke(req("/x", { method: "DELETE" }), ctx({ slug, invitationId: second.invitation.id }))
    cookieJar.clear()
    await signInAs("usr_demo_theo")
    for (const { inviteUrl } of [first, second]) {
      expect((await acceptByToken(req("/x", { method: "POST" }), ctx({ token: inviteUrl.split("/").pop()! }))).status).toBe(404)
    }
  })
})
