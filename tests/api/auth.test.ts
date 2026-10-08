import { beforeAll, beforeEach, describe, expect, it } from "vitest"
import { POST as login } from "@/app/api/auth/login/route"
import { POST as logout } from "@/app/api/auth/logout/route"
import { POST as signup } from "@/app/api/auth/signup/route"
import { GET as getSession } from "@/app/api/session/route"
import { DEMO_COOKIES, DEMO_PASSWORD } from "@/constants/demo"
import { EErrorCode } from "@/enums/errors"
import { resetDatabase } from "@/server/db/setup"
import { cookieJar } from "../support/setup"
import { ctx, json, req } from "../support/request"

const post = (handler: typeof login, path: string, body: unknown) => handler(req(path, { method: "POST", body }), ctx({}))
const session = () => getSession(req("/api/session"), ctx({}))

describe("authentication", () => {
  beforeAll(async () => {
    await resetDatabase()
  })
  beforeEach(() => cookieJar.clear())

  it("rejects unauthenticated requests with 401", async () => {
    const res = await session()
    expect(res.status).toBe(401)
    expect((await json(res)).error.code).toBe(EErrorCode.Unauthenticated)
  })

  it("logs in with valid credentials and sets an opaque session cookie", async () => {
    const res = await post(login, "/api/auth/login", { email: "AMARA@creatorhub.dev", password: DEMO_PASSWORD })
    expect(res.status).toBe(200)
    const token = cookieJar.get(DEMO_COOKIES.session)
    expect(token).toBeTruthy()
    expect(token).not.toContain("usr_")
    expect((await json(await session())).data.user.email).toBe("amara@creatorhub.dev")
  })

  it("uses the same error for unknown emails and wrong passwords", async () => {
    const wrong = await json(await post(login, "/api/auth/login", { email: "amara@creatorhub.dev", password: "nope" }))
    const unknown = await json(await post(login, "/api/auth/login", { email: "ghost@creatorhub.dev", password: "nope" }))
    expect(wrong.error.message).toBe(unknown.error.message)
  })

  it("rate-limits repeated failed logins", async () => {
    let last: Response | undefined
    for (let i = 0; i < 10; i++) {
      last = await post(login, "/api/auth/login", { email: "theo@creatorhub.dev", password: "wrong-password" })
    }
    expect(last?.status).toBe(429)
  })

  it("signs up a new user with no workspaces yet", async () => {
    const res = await post(signup, "/api/auth/signup", { name: "Kemi Ade", email: "kemi@example.com", password: "s3cure-pass" })
    expect(res.status).toBe(201)
    const { data } = await json(await session())
    expect(data.user.name).toBe("Kemi Ade")
    expect(data.workspaces).toEqual([])
  })

  it("rejects duplicate emails and weak passwords", async () => {
    const dup = await post(signup, "/api/auth/signup", { name: "Amara", email: "amara@creatorhub.dev", password: "s3cure-pass" })
    expect(dup.status).toBe(409)
    const weak = await post(signup, "/api/auth/signup", { name: "Weak", email: "weak@example.com", password: "short" })
    expect(weak.status).toBe(422)
  })

  it("logs out and invalidates the session server-side", async () => {
    await post(login, "/api/auth/login", { email: "amara@creatorhub.dev", password: DEMO_PASSWORD })
    const token = cookieJar.get(DEMO_COOKIES.session)!
    await logout(req("/api/auth/logout", { method: "POST" }), ctx({}))
    cookieJar.set(DEMO_COOKIES.session, token)
    expect((await session()).status).toBe(401)
  })
})
