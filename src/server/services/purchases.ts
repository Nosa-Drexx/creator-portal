import "server-only"

import { and, asc, count, desc, eq, like, or } from "drizzle-orm"
import { EPurchaseSort, EPurchaseStatus } from "@/enums/purchases"
import { db } from "@/server/db/client"
import { content, purchases } from "@/server/db/schema"
import type { PaginatedResponse } from "@/types/common"
import type { Purchase, PurchaseListParams } from "@/types/purchases"
import type { TenantContext } from "./tenant"

/** Creators see enough to recognise a buyer, not their full address */
export function maskEmail(email: string) {
  const [local, domain] = email.split("@")
  if (!domain) return email
  return `${local.slice(0, 2)}${"•".repeat(Math.max(local.length - 2, 3))}@${domain}`
}

export async function listPurchases(
  ctx: TenantContext,
  params: Required<Pick<PurchaseListParams, "sort" | "order" | "page" | "limit">> & PurchaseListParams,
): Promise<PaginatedResponse<Purchase>> {
  const term = params.search ? `%${params.search}%` : null
  const where = and(
    eq(purchases.workspaceId, ctx.workspace.id),
    params.status ? eq(purchases.status, params.status) : undefined,
    params.contentId ? eq(purchases.contentId, params.contentId) : undefined,
    term
      ? or(
          like(purchases.buyerName, term),
          like(purchases.buyerEmail, term),
          like(content.title, term),
          like(purchases.country, term),
          like(purchases.id, term),
        )
      : undefined,
  )

  const direction = params.order === "asc" ? asc : desc
  const sortColumn = params.sort === EPurchaseSort.Amount ? purchases.amountCents : purchases.createdAt

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({ purchase: purchases, content })
      .from(purchases)
      .innerJoin(content, eq(content.id, purchases.contentId))
      .where(where)
      .orderBy(direction(sortColumn), desc(purchases.id))
      .limit(params.limit)
      .offset((params.page - 1) * params.limit),
    db
      .select({ total: count() })
      .from(purchases)
      .innerJoin(content, eq(content.id, purchases.contentId))
      .where(where),
  ])

  return {
    data: rows.map(({ purchase, content: item }) => ({
      id: purchase.id,
      content: {
        id: item.id,
        title: item.title,
        thumbnailKey: item.thumbnailKey,
        deleted: item.deletedAt !== null,
      },
      buyerName: purchase.buyerName,
      buyerEmail: maskEmail(purchase.buyerEmail),
      amountCents: purchase.amountCents,
      currency: purchase.currency,
      country: purchase.country,
      status: purchase.status as EPurchaseStatus,
      createdAt: purchase.createdAt.toISOString(),
    })),
    meta: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / params.limit)),
    },
  }
}
