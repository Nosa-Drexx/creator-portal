import {
  BUYER_FIRST_NAMES,
  BUYER_LAST_NAMES,
  COUNTRY_WEIGHTS,
  PURCHASE_STATUS_WEIGHTS,
  type ContentFixture,
} from "./fixtures"

const DAY_MS = 86_400_000

/** Deterministic PRNG so every reset produces the same demo */
export function createRandom(seed: number) {
  let a = seed
  const next = () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const pick = <T>(items: readonly T[]) => items[Math.floor(next() * items.length)]
  const weighted = <T>(entries: readonly [T, number][]) => {
    const total = entries.reduce((sum, [, w]) => sum + w, 0)
    let roll = next() * total
    for (const [value, w] of entries) {
      roll -= w
      if (roll <= 0) return value
    }
    return entries[entries.length - 1][0]
  }
  return { next, pick, weighted }
}

export type Random = ReturnType<typeof createRandom>

export interface GeneratedPurchase {
  contentIndex: number
  buyerName: string
  buyerEmail: string
  amountCents: number
  country: string
  status: "completed" | "pending" | "refunded" | "failed"
  createdAt: Date
}

export function generatePurchases(
  items: ContentFixture[],
  now: Date,
  rand: Random,
  dailyRate = 0.11,
): GeneratedPurchase[] {
  const out: GeneratedPurchase[] = []

  items.forEach((item, contentIndex) => {
    if (item.status !== "published" || item.weight === 0) return

    for (let daysAgo = item.dayOffset; daysAgo >= 0; daysAgo--) {
      const sinceLaunch = item.dayOffset - daysAgo
      const launchBoost = sinceLaunch < 7 ? 3 - sinceLaunch * 0.28 : 1
      const audienceGrowth = 0.55 + 0.9 * (1 - daysAgo / 365)
      const weekday = new Date(now.getTime() - daysAgo * DAY_MS).getDay()
      const weekendDip = weekday === 0 || weekday === 6 ? 0.75 : 1
      const expected = dailyRate * item.weight * launchBoost * audienceGrowth * weekendDip
      const count = Math.floor(expected + rand.next())

      for (let i = 0; i < count; i++) {
        const createdAt = new Date(
          now.getTime() - daysAgo * DAY_MS - Math.floor(rand.next() * DAY_MS * 0.9),
        )
        const status =
          daysAgo <= 2 && rand.next() < 0.3 ? "pending" : rand.weighted(PURCHASE_STATUS_WEIGHTS)
        const first = rand.pick(BUYER_FIRST_NAMES)
        const last = rand.pick(BUYER_LAST_NAMES)
        out.push({
          contentIndex,
          buyerName: `${first} ${last}`,
          buyerEmail: `${first}.${last}${Math.floor(rand.next() * 90 + 10)}@example.com`
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, ""),
          amountCents: item.priceCents,
          country: rand.weighted(COUNTRY_WEIGHTS),
          status,
          createdAt: createdAt > now ? now : createdAt,
        })
      }
    }
  })

  return out.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
}

export function estimateViews(purchaseCount: number, rand: Random) {
  const conversion = 0.025 + rand.next() * 0.035
  return Math.round(purchaseCount / conversion + rand.next() * 400)
}

export { DAY_MS }
