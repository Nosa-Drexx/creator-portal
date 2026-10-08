import { z } from "zod"
import { signupSchema } from "./auth"

export const profileSchema = z.object({
  name: signupSchema.shape.name,
  email: signupSchema.shape.email,
})

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: signupSchema.shape.password,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords don't match" })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ["newPassword"],
    message: "Choose a password you haven't used here",
  })

export type ProfileInput = z.infer<typeof profileSchema>
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"]
