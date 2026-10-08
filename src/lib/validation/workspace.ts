import { z } from "zod"
import { ACCENT_COLORS } from "@/constants/workspace"

const colors = ACCENT_COLORS.map((c) => c.value) as [string, ...string[]]

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(2, "Use at least 2 characters").max(48, "Keep it under 48 characters"),
  handle: z
    .string()
    .trim()
    .regex(/^@?[a-z0-9_.]{2,30}$/i, "Letters, numbers, dots and underscores only")
    .transform((v) => (v.startsWith("@") ? v : `@${v}`).toLowerCase()),
  accentColor: z.enum(colors, { error: "Pick a colour" }),
})

export type CreateWorkspaceInput = z.input<typeof createWorkspaceSchema>
