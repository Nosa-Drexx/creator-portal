import { isValidPhoneNumber } from "libphonenumber-js"
import { z } from "zod"
import { EDocumentType } from "@/enums/verification"

const MIN_AGE = 18

function ageFrom(dateOfBirth: string) {
  const dob = new Date(dateOfBirth)
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const beforeBirthday =
    now.getMonth() < dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())
  if (beforeBirthday) age -= 1
  return age
}

export const personalInfoSchema = z.object({
  fullName: z.string().trim().min(3, "Enter your full legal name").max(120),
  dateOfBirth: z
    .string()
    .min(1, "Enter your date of birth")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date")
    .refine((v) => ageFrom(v) >= MIN_AGE, `You must be at least ${MIN_AGE} to earn on CreatorHub`),
  country: z.string().length(2, "Select your country"),
  phone: z.string().min(1, "Enter your phone number").refine((v) => isValidPhoneNumber(v), "Enter a valid phone number"),
  address: z.string().trim().min(6, "Enter your residential address").max(240),
})

export const documentSchema = z.object({
  documentType: z.enum(EDocumentType, { error: "Choose a document type" }),
  documentKey: z.string({ error: "Upload a photo of your document" }).min(1, "Upload a photo of your document"),
})

export const selfieSchema = z.object({
  selfieKey: z.string({ error: "Take or upload a selfie" }).min(1, "Take or upload a selfie"),
})

export const verificationPayloadSchema = personalInfoSchema.extend(documentSchema.shape).extend(selfieSchema.shape)

export type VerificationFormValues = z.infer<typeof verificationPayloadSchema>
