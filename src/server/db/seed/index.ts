import type { Database } from "../client"
import * as schema from "../schema"
import {
  DEMO_USER,
  FOREIGN_CONTENT,
  OTHER_USER,
  STUDIO_CONTENT,
  TRAVEL_CONTENT,
  WORKSPACES,
  type ContentFixture,
} from "./fixtures"
import { createRandom, DAY_MS, estimateViews, generatePurchases } from "./generate"

const CHUNK = 200

async function insertChunked<T extends Record<string, unknown>>(
  db: Database,
  table: Parameters<Database["insert"]>[0],
  rows: T[],
) {
  for (let i = 0; i < rows.length; i += CHUNK) {
    await db.insert(table).values(rows.slice(i, i + CHUNK) as never)
  }
}

const SAMPLE_VIDEO = "/seed/videos/sample-reel.mp4"

function atNineAm(date: Date) {
  date.setHours(9, 0, 0, 0)
  return date
}

function thumbPath(n: number) {
  return `/seed/thumbnails/thumb-${String(n).padStart(2, "0")}.jpg`
}

async function seedWorkspaceContent(
  db: Database,
  workspaceId: string,
  prefix: string,
  items: ContentFixture[],
  now: Date,
  seed: number,
) {
  const rand = createRandom(seed)
  const purchases = generatePurchases(items, now, rand)
  const ids = items.map((_, i) => `cnt_${prefix}_${String(i + 1).padStart(2, "0")}`)

  const contentRows = items.map((item, i) => {
    const bought = purchases.filter((p) => p.contentIndex === i).length
    const offsetMs = item.dayOffset * DAY_MS
    const createdAt = new Date(
      now.getTime() - (item.status === "published" ? offsetMs : DAY_MS * (2 + i)),
    )
    return {
      id: ids[i],
      workspaceId,
      title: item.title,
      description: item.description,
      priceCents: item.priceCents,
      thumbnailKey: thumbPath(item.thumb),
      // Drafts may still be missing media; everything else plays the bundled sample reel
      videoKey: item.status === "draft" && i % 2 === 1 ? null : SAMPLE_VIDEO,
      videoFileName: `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}.mp4`,
      videoSizeBytes: item.durationSeconds * 1_100_000,
      durationSeconds: item.durationSeconds,
      status: item.status,
      scheduledFor: item.status === "scheduled" ? atNineAm(new Date(now.getTime() + offsetMs)) : null,
      publishedAt: item.status === "published" ? createdAt : null,
      views: item.status === "published" ? estimateViews(bought, rand) : 0,
      createdAt,
      updatedAt: createdAt,
    }
  })

  await insertChunked(db, schema.content, contentRows)
  await insertChunked(
    db,
    schema.purchases,
    purchases.map((p, i) => ({
      id: `pur_${prefix}_${String(i + 1).padStart(5, "0")}`,
      workspaceId,
      contentId: ids[p.contentIndex],
      buyerName: p.buyerName,
      buyerEmail: p.buyerEmail,
      amountCents: p.amountCents,
      currency: "USD",
      country: p.country,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.createdAt,
    })),
  )

  return { content: contentRows.length, purchases: purchases.length }
}

export async function clearDatabase(db: Database) {
  await db.delete(schema.purchases)
  await db.delete(schema.uploads)
  await db.delete(schema.content)
  await db.delete(schema.verifications)
  await db.delete(schema.memberships)
  await db.delete(schema.workspaces)
  await db.delete(schema.users)
}

export async function seedDatabase(db: Database, now = new Date()) {
  await clearDatabase(db)

  await db.insert(schema.users).values([DEMO_USER, OTHER_USER])
  await db.insert(schema.workspaces).values(Object.values(WORKSPACES).map((w) => ({ ...w })))
  await db.insert(schema.memberships).values([
    { id: "mem_amara_studio", workspaceId: WORKSPACES.studio.id, userId: DEMO_USER.id, role: "owner" },
    { id: "mem_amara_travel", workspaceId: WORKSPACES.travel.id, userId: DEMO_USER.id, role: "owner" },
    { id: "mem_theo_north", workspaceId: WORKSPACES.foreign.id, userId: OTHER_USER.id, role: "owner" },
  ])

  const reviewedAt = new Date(now.getTime() - 400 * DAY_MS)
  await db.insert(schema.verifications).values([
    {
      id: "ver_studio",
      workspaceId: WORKSPACES.studio.id,
      status: "verified",
      fullName: DEMO_USER.name,
      country: "GB",
      documentType: "passport",
      submittedAt: reviewedAt,
      reviewedAt,
    },
    { id: "ver_travel", workspaceId: WORKSPACES.travel.id, status: "unverified" },
    { id: "ver_north", workspaceId: WORKSPACES.foreign.id, status: "verified", reviewedAt },
  ])

  const studio = await seedWorkspaceContent(db, WORKSPACES.studio.id, "studio", STUDIO_CONTENT, now, 7)
  const travel = await seedWorkspaceContent(db, WORKSPACES.travel.id, "travel", TRAVEL_CONTENT, now, 11)
  const foreign = await seedWorkspaceContent(db, WORKSPACES.foreign.id, "north", FOREIGN_CONTENT, now, 13)

  return { studio, travel, foreign }
}
