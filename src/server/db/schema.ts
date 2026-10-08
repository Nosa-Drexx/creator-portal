import { sql } from "drizzle-orm"
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
}

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  // Empty only for rows created before auth existed; setup re-seeds those
  passwordHash: text("password_hash").notNull().default(""),
  avatarUrl: text("avatar_url"),
  ...timestamps,
})

/** Only a SHA-256 of the session token is stored, so a DB leak can't be replayed as cookies */
export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    tokenHash: text("token_hash").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    userAgent: text("user_agent"),
    ...timestamps,
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
)

export const workspaces = sqliteTable("workspaces", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  handle: text("handle").notNull(),
  accentColor: text("accent_color").notNull(),
  avatarUrl: text("avatar_url"),
  ...timestamps,
})

export const memberships = sqliteTable(
  "memberships",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["owner", "editor"] }).notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex("memberships_ws_user_idx").on(t.workspaceId, t.userId)],
)

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .unique()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["unverified", "pending", "verified", "rejected"] })
    .notNull()
    .default("unverified"),
  fullName: text("full_name"),
  dateOfBirth: text("date_of_birth"),
  country: text("country"),
  phone: text("phone"),
  address: text("address"),
  documentType: text("document_type", { enum: ["passport", "drivers_license", "national_id"] }),
  documentKey: text("document_key"),
  selfieKey: text("selfie_key"),
  submittedAt: integer("submitted_at", { mode: "timestamp_ms" }),
  reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
  ...timestamps,
})

export const content = sqliteTable(
  "content",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    priceCents: integer("price_cents").notNull(),
    thumbnailKey: text("thumbnail_key"),
    videoKey: text("video_key"),
    videoFileName: text("video_file_name"),
    videoSizeBytes: integer("video_size_bytes"),
    durationSeconds: integer("duration_seconds"),
    status: text("status", { enum: ["draft", "scheduled", "published"] }).notNull(),
    scheduledFor: integer("scheduled_for", { mode: "timestamp_ms" }),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    views: integer("views").notNull().default(0),
    // Soft delete keeps purchase history intact for finance/reporting
    deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (t) => [index("content_ws_status_idx").on(t.workspaceId, t.status)],
)

export const purchases = sqliteTable(
  "purchases",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    contentId: text("content_id")
      .notNull()
      .references(() => content.id),
    buyerName: text("buyer_name").notNull(),
    buyerEmail: text("buyer_email").notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    country: text("country").notNull(),
    status: text("status", { enum: ["completed", "pending", "refunded", "failed"] }).notNull(),
    ...timestamps,
  },
  (t) => [
    index("purchases_ws_created_idx").on(t.workspaceId, t.createdAt),
    index("purchases_content_idx").on(t.contentId),
  ],
)

export const uploads = sqliteTable("uploads", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  key: text("key").notNull().unique(),
  kind: text("kind", { enum: ["thumbnail", "video", "document", "selfie"] }).notNull(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  status: text("status", { enum: ["pending", "complete"] }).notNull().default("pending"),
  ...timestamps,
})

export type UserRow = typeof users.$inferSelect
export type SessionRow = typeof sessions.$inferSelect
export type WorkspaceRow = typeof workspaces.$inferSelect
export type MembershipRow = typeof memberships.$inferSelect
export type VerificationRow = typeof verifications.$inferSelect
export type ContentRow = typeof content.$inferSelect
export type PurchaseRow = typeof purchases.$inferSelect
export type UploadRow = typeof uploads.$inferSelect
