import { readFileSync } from "node:fs"
import { NextRequest } from "next/server"
import { beforeEach, describe, expect, it } from "vitest"
import { GET as getAvatar } from "@/app/api/avatars/[userId]/[file]/route"
import { PUT as putAvatar } from "@/app/api/me/avatar/route"
import { POST as changePassword } from "@/app/api/me/password/route"
import { PATCH as updateMe } from "@/app/api/me/route"
import { GET as getSession } from "@/app/api/session/route"
import { DEMO_COOKIES, DEMO_PASSWORD } from "@/constants/demo"
import { resetDatabase } from "@/server/db/setup"
import { cookieJar } from "../support/setup"
import { ctx, json, req, signInAs } from "../support/request"

const session = () => getSession(req("/api/session"), ctx({}))

describe("profile", () => {
  beforeEach(async () => {
    cookieJar.clear()
    await resetDatabase()
    await signInAs("usr_demo_amara")
  })

  it("updates the name but never the email", async () => {
    const res = await updateMe(req("/api/me", { method: "PATCH", body: { name: "Amara L.", email: "hijack@example.com" } }), ctx({}))
    expect(res.status).toBe(200)
    expect((await json(await session())).data.user).toMatchObject({ name: "Amara L.", email: "amara@creatorhub.dev" })
  })

  it("requires the current password and signs out other sessions on change", async () => {
    const otherDevice = cookieJar.get(DEMO_COOKIES.session)!
    const wrong = await changePassword(
      req("/api/me/password", { method: "POST", body: { currentPassword: "nope", newPassword: "n3w-password", confirmPassword: "n3w-password" } }),
      ctx({}),
    )
    expect(wrong.status).toBe(422)

    const ok = await changePassword(
      req("/api/me/password", { method: "POST", body: { currentPassword: DEMO_PASSWORD, newPassword: "n3w-password", confirmPassword: "n3w-password" } }),
      ctx({}),
    )
    expect(ok.status).toBe(200)
    expect((await session()).status).toBe(200)
    cookieJar.set(DEMO_COOKIES.session, otherDevice)
    expect((await session()).status).toBe(401)
  })

  it("uploads an avatar that teammates can fetch, and rejects bad paths", async () => {
    const image = readFileSync("public/seed/avatars/avatar-64.jpg")
    const res = await putAvatar(
      new NextRequest("http://localhost/api/me/avatar", { method: "PUT", body: image, headers: { "content-type": "image/jpeg" } }),
      ctx({}),
    )
    const { data } = await json(res)
    expect(data.avatarUrl).toMatch(/^\/api\/avatars\/usr_demo_amara\/[a-f0-9-]+\.jpg$/)

    const [, , , userId, file] = data.avatarUrl.split("/")
    await signInAs("usr_demo_theo")
    const fetched = await getAvatar(req(data.avatarUrl), ctx({ userId, file }))
    expect(fetched.status).toBe(200)
    expect(fetched.headers.get("content-type")).toBe("image/jpeg")

    const traversal = await getAvatar(req("/api/avatars/x"), ctx({ userId: "usr_demo_amara", file: "..%2F..%2Fdb" }))
    expect(traversal.status).toBe(404)
  })

  it("rejects non-image avatars", async () => {
    const res = await putAvatar(
      new NextRequest("http://localhost/api/me/avatar", { method: "PUT", body: "<svg/>", headers: { "content-type": "image/svg+xml" } }),
      ctx({}),
    )
    expect(res.status).toBe(400)
  })
})
