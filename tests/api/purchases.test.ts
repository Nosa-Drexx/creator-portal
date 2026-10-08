import { beforeAll, describe, expect, it } from "vitest"
import { GET as listPurchases } from "@/app/api/workspaces/[slug]/purchases/route"
import { resetDatabase } from "@/server/db/setup"
import { cookieJar } from "../support/setup"
import { ctx, json, req, signInAs } from "../support/request"

const slug = "amara-studio"
const search = async (term: string) => {
  const res = await listPurchases(req(`/api/workspaces/${slug}/purchases?search=${encodeURIComponent(term)}`), ctx({ slug }))
  const { data, meta } = (await json(res)).data as { data: { country: string }[]; meta: { total: number } }
  return { items: data, total: meta.total }
}

describe("purchase search", () => {
  beforeAll(async () => {
    await resetDatabase()
    cookieJar.clear()
    await signInAs("usr_demo_amara")
  })

  it("matches countries by name, not just their ISO code", async () => {
    const byName = await search("Canada")
    expect(byName.total).toBeGreaterThan(0)
    expect(byName.items.every((p) => p.country === "CA")).toBe(true)
    expect((await search("united kingdom")).items.every((p) => p.country === "GB")).toBe(true)
  })
})
