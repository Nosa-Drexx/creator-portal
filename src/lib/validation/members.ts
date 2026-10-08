import { z } from "zod"
import { ALL_PERMISSIONS } from "@/constants/permissions"

export const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  roleId: z.string().min(1, "Choose a role"),
})

export const changeRoleSchema = z.object({ roleId: z.string().min(1) })

export const roleSchema = z.object({
  name: z.string().trim().min(2, "Give the role a name").max(40),
  description: z.string().trim().max(160).default(""),
  permissions: z
    .array(z.enum(ALL_PERMISSIONS as [string, ...string[]]))
    .min(1, "Grant at least one permission"),
})

export type InviteInput = z.infer<typeof inviteSchema>
export type RoleInput = z.input<typeof roleSchema>
