import "server-only"

import { and, eq, inArray } from "drizzle-orm"
import { EVerificationStatus } from "@/enums/verification"
import { db } from "@/server/db/client"
import { uploads, verifications, type VerificationRow } from "@/server/db/schema"
import { env } from "@/server/lib/env"
import { Errors } from "@/server/lib/errors"
import { newId } from "@/server/lib/ids"
import type { Verification, VerificationPayload } from "@/types/verification"

function reviewDueAt(row: VerificationRow) {
  if (!row.submittedAt) return null
  return new Date(row.submittedAt.getTime() + env.VERIFICATION_REVIEW_SECONDS * 1000)
}

/** Simulates an async review provider: pending submissions auto-approve after a short delay */
export async function getVerification(workspaceId: string): Promise<VerificationRow> {
  let row = await db.query.verifications.findFirst({
    where: eq(verifications.workspaceId, workspaceId),
  })

  if (!row) {
    ;[row] = await db
      .insert(verifications)
      .values({ id: newId("ver"), workspaceId, status: EVerificationStatus.Unverified })
      .returning()
  }

  const due = reviewDueAt(row)
  if (row.status === EVerificationStatus.Pending && due && due <= new Date()) {
    ;[row] = await db
      .update(verifications)
      .set({ status: EVerificationStatus.Verified, reviewedAt: due, updatedAt: new Date() })
      .where(eq(verifications.id, row.id))
      .returning()
  }

  return row
}

export function toVerificationDto(row: VerificationRow): Verification {
  const due = reviewDueAt(row)
  return {
    status: row.status as EVerificationStatus,
    fullName: row.fullName,
    dateOfBirth: row.dateOfBirth,
    country: row.country,
    phone: row.phone,
    address: row.address,
    documentType: row.documentType as Verification["documentType"],
    documentKey: row.documentKey,
    selfieKey: row.selfieKey,
    submittedAt: row.submittedAt?.toISOString() ?? null,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    estimatedReviewAt: row.status === EVerificationStatus.Pending ? (due?.toISOString() ?? null) : null,
  }
}

export async function submitVerification(
  ctx: { workspace: { id: string } },
  payload: VerificationPayload,
): Promise<VerificationRow> {
  const current = await getVerification(ctx.workspace.id)
  if (current.status === EVerificationStatus.Verified) throw Errors.conflict("This workspace is already verified")
  if (current.status === EVerificationStatus.Pending) throw Errors.conflict("Your verification is already under review")

  const keys = [payload.documentKey, payload.selfieKey]
  const owned = await db
    .select({ key: uploads.key })
    .from(uploads)
    .where(and(eq(uploads.workspaceId, ctx.workspace.id), eq(uploads.status, "complete"), inArray(uploads.key, keys)))
  if (owned.length !== keys.length) throw Errors.badRequest("Your document or selfie upload could not be found. Please upload it again.")

  const now = new Date()
  const [row] = await db
    .update(verifications)
    .set({ ...payload, status: EVerificationStatus.Pending, submittedAt: now, reviewedAt: null, updatedAt: now })
    .where(eq(verifications.id, current.id))
    .returning()
  return row
}

/** Demo-state control used by reviewers to jump between verification states */
export async function setVerificationStatus(workspaceId: string, status: EVerificationStatus) {
  const current = await getVerification(workspaceId)
  const now = new Date()
  await db
    .update(verifications)
    .set({
      status,
      submittedAt:
        status === EVerificationStatus.Unverified
          ? null
          : status === EVerificationStatus.Pending
            ? now
            : (current.submittedAt ?? now),
      reviewedAt: status === EVerificationStatus.Verified ? now : null,
      updatedAt: now,
    })
    .where(eq(verifications.id, current.id))
}
