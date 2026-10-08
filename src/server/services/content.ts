import "server-only"

import { and, desc, eq, inArray, isNull, like, lte, sql } from "drizzle-orm"
import { QueryBuilder } from "drizzle-orm/sqlite-core"
import { EContentStatus } from "@/enums/content"
import { EPurchaseStatus } from "@/enums/purchases"
import { db } from "@/server/db/client"
import { content, purchases, uploads, type ContentRow } from "@/server/db/schema"
import { Errors } from "@/server/lib/errors"
import { newId } from "@/server/lib/ids"
import type { ContentPayloadInput } from "@/lib/validation/content"
import type { Content, ContentListParams } from "@/types/content"
import { assertPermission, hasPermission } from "./permissions"
import { assertCanSetStatus, canPublish, requiresVerification } from "./publishing"
import type { TenantContext } from "./tenant"

// Built without the db so importing this module never opens a connection
const stats = new QueryBuilder()
  .select({
    contentId: purchases.contentId,
    purchases: sql<number>`count(*)`.as("purchase_count"),
    revenueCents: sql<number>`coalesce(sum(${purchases.amountCents}), 0)`.as("revenue_cents"),
  })
  .from(purchases)
  .where(eq(purchases.status, EPurchaseStatus.Completed))
  .groupBy(purchases.contentId)
  .as("stats")

function toDto(row: ContentRow, purchaseCount = 0, revenueCents = 0): Content {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priceCents: row.priceCents,
    thumbnailKey: row.thumbnailKey,
    videoKey: row.videoKey,
    // Video metadata only exists alongside a video file
    videoFileName: row.videoKey ? row.videoFileName : null,
    videoSizeBytes: row.videoKey ? row.videoSizeBytes : null,
    durationSeconds: row.videoKey ? row.durationSeconds : null,
    status: row.status as EContentStatus,
    scheduledFor: row.scheduledFor?.toISOString() ?? null,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    views: row.views,
    purchases: Number(purchaseCount),
    revenueCents: Number(revenueCents),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

/** Scheduled items whose time has passed go live on the next read (stand-in for a scheduler job) */
async function promoteDueScheduled(ctx: TenantContext) {
  if (!canPublish(ctx.verificationStatus)) return
  const now = new Date()
  await db
    .update(content)
    .set({ status: EContentStatus.Published, publishedAt: sql`${content.scheduledFor}`, updatedAt: now })
    .where(
      and(
        eq(content.workspaceId, ctx.workspace.id),
        eq(content.status, EContentStatus.Scheduled),
        lte(content.scheduledFor, now),
      ),
    )
}

/** Sales and performance data stay server-side for roles without analytics access */
function withMetricsFor(ctx: TenantContext, item: Content): Content {
  if (hasPermission(ctx.permissions, "view:analytics")) return item
  return { ...item, views: null, purchases: null, revenueCents: null }
}

export async function listContent(ctx: TenantContext, params: ContentListParams) {
  assertPermission(ctx, "view:content")
  await promoteDueScheduled(ctx)
  const rows = await db
    .select({ row: content, purchases: stats.purchases, revenueCents: stats.revenueCents })
    .from(content)
    .leftJoin(stats, eq(stats.contentId, content.id))
    .where(
      and(
        eq(content.workspaceId, ctx.workspace.id),
        isNull(content.deletedAt),
        params.status ? eq(content.status, params.status) : undefined,
        params.search ? like(content.title, `%${params.search}%`) : undefined,
      ),
    )
    .orderBy(desc(content.updatedAt))

  return rows.map((r) => withMetricsFor(ctx, toDto(r.row, r.purchases ?? 0, r.revenueCents ?? 0)))
}

async function findOwned(ctx: TenantContext, id: string) {
  const [match] = await db
    .select({ row: content, purchases: stats.purchases, revenueCents: stats.revenueCents })
    .from(content)
    .leftJoin(stats, eq(stats.contentId, content.id))
    .where(and(eq(content.id, id), eq(content.workspaceId, ctx.workspace.id), isNull(content.deletedAt)))
    .limit(1)
  if (!match) throw Errors.notFound("Content")
  return match
}

export async function getContent(ctx: TenantContext, id: string) {
  assertPermission(ctx, "view:content")
  await promoteDueScheduled(ctx)
  const match = await findOwned(ctx, id)
  return withMetricsFor(ctx, toDto(match.row, match.purchases ?? 0, match.revenueCents ?? 0))
}

/** Media keys must be completed uploads owned by this workspace (seed assets are public paths) */
async function assertMediaOwned(ctx: TenantContext, keys: (string | null)[], previous: (string | null)[] = []) {
  const toCheck = keys.filter((k): k is string => !!k && !previous.includes(k) && !k.startsWith("/seed/"))
  if (toCheck.length === 0) return
  const owned = await db
    .select({ key: uploads.key })
    .from(uploads)
    .where(and(eq(uploads.workspaceId, ctx.workspace.id), eq(uploads.status, "complete"), inArray(uploads.key, toCheck)))
  if (owned.length !== toCheck.length) throw Errors.badRequest("One of the attached files could not be found. Please upload it again.")
}

async function videoMeta(key: string | null) {
  if (!key) return { videoFileName: null, videoSizeBytes: null }
  const upload = await db.query.uploads.findFirst({ where: eq(uploads.key, key) })
  return { videoFileName: upload?.fileName ?? null, videoSizeBytes: upload?.sizeBytes ?? null }
}

function statusFields(payload: ContentPayloadInput, existing?: ContentRow) {
  const now = new Date()
  return {
    status: payload.status,
    scheduledFor:
      payload.status === EContentStatus.Scheduled && payload.scheduledFor ? new Date(payload.scheduledFor) : null,
    publishedAt:
      payload.status === EContentStatus.Published ? (existing?.publishedAt ?? now) : null,
  }
}

/** Role first (can this person publish?), then the workspace-level verification rule */
function assertStatusChange(ctx: TenantContext, from: EContentStatus | null, to: EContentStatus) {
  const touchesPublic = requiresVerification(to) || (from !== null && requiresVerification(from))
  if (from !== to && touchesPublic) {
    assertPermission(ctx, "publish:content", "Your role can't publish or unpublish videos. Save it as a draft for an admin to publish.")
  }
  if (from !== to) assertCanSetStatus(ctx.verificationStatus, to)
}

export async function createContent(ctx: TenantContext, payload: ContentPayloadInput) {
  assertPermission(ctx, "create:content")
  assertStatusChange(ctx, null, payload.status)
  await assertMediaOwned(ctx, [payload.thumbnailKey, payload.videoKey])

  const [row] = await db
    .insert(content)
    .values({
      id: newId("cnt"),
      workspaceId: ctx.workspace.id,
      title: payload.title,
      description: payload.description,
      priceCents: payload.priceCents,
      thumbnailKey: payload.thumbnailKey,
      videoKey: payload.videoKey,
      durationSeconds: payload.durationSeconds ?? null,
      ...(await videoMeta(payload.videoKey)),
      ...statusFields(payload),
    })
    .returning()
  return withMetricsFor(ctx, toDto(row))
}

export async function updateContent(ctx: TenantContext, id: string, payload: ContentPayloadInput) {
  assertPermission(ctx, "edit:content")
  const { row: existing } = await findOwned(ctx, id)
  assertStatusChange(ctx, existing.status as EContentStatus, payload.status)
  await assertMediaOwned(ctx, [payload.thumbnailKey, payload.videoKey], [existing.thumbnailKey, existing.videoKey])

  const videoChanged = payload.videoKey !== existing.videoKey
  await db
    .update(content)
    .set({
      title: payload.title,
      description: payload.description,
      priceCents: payload.priceCents,
      thumbnailKey: payload.thumbnailKey,
      videoKey: payload.videoKey,
      ...(videoChanged
        ? { ...(await videoMeta(payload.videoKey)), durationSeconds: payload.durationSeconds ?? null }
        : {}),
      ...statusFields(payload, existing),
      updatedAt: new Date(),
    })
    .where(eq(content.id, id))
  return getContent(ctx, id)
}

export async function deleteContent(ctx: TenantContext, id: string) {
  assertPermission(ctx, "delete:content")
  await findOwned(ctx, id)
  await db.update(content).set({ deletedAt: new Date(), updatedAt: new Date() }).where(eq(content.id, id))
}
