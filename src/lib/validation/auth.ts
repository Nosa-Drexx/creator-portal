import { z } from "zod"

const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(120)

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password").max(200),
})

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email,
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(200)
    .regex(/[a-zA-Z]/, "Include at least one letter")
    .regex(/\d/, "Include at least one number"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
