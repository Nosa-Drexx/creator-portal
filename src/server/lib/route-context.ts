import "server-only"

import { requireTenant } from "@/server/services/tenant"

type Params<T extends Record<string, string | string[]>> = { params: Promise<T> }

export async function tenantFrom(ctx: Params<{ slug: string }>) {
  const { slug } = await ctx.params
  return requireTenant(slug)
}

export async function keyFrom(ctx: Params<{ key: string[] }>) {
  const { key } = await ctx.params
  return key.map(decodeURIComponent).join("/")
}
