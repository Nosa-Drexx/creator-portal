import { CreditCardIcon, IdIcon, PassportIcon } from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"
import { EDocumentType } from "@/enums/verification"
import type { VerificationFormValues } from "@/lib/validation/verification"

export const WIZARD_STEPS = [
  { id: "personal", label: "Personal info", short: "Details" },
  { id: "document", label: "Identity document", short: "Document" },
  { id: "selfie", label: "Selfie check", short: "Selfie" },
  { id: "confirm", label: "Confirmation", short: "Confirm" },
] as const

export const LAST_STEP = WIZARD_STEPS.length - 1

export const STEP_FIELDS: Record<number, (keyof VerificationFormValues)[]> = {
  0: ["fullName", "dateOfBirth", "country", "phone", "address"],
  1: ["documentType", "documentKey"],
  2: ["selfieKey"],
  3: [],
}

export const VERIFICATION_DEFAULTS: Partial<VerificationFormValues> = {
  fullName: "",
  dateOfBirth: "",
  country: "",
  phone: "",
  address: "",
  documentKey: "",
  selfieKey: "",
}

export const DOCUMENT_TYPES: { value: EDocumentType; label: string; hint: string; icon: IconSvgElement }[] = [
  { value: EDocumentType.Passport, label: "Passport", hint: "Photo page", icon: PassportIcon },
  { value: EDocumentType.DriversLicense, label: "Driver's licence", hint: "Front side", icon: CreditCardIcon },
  { value: EDocumentType.NationalId, label: "National ID", hint: "Front side", icon: IdIcon },
]

export const DOCUMENT_LABEL: Record<EDocumentType, string> = {
  [EDocumentType.Passport]: "Passport",
  [EDocumentType.DriversLicense]: "Driver's licence",
  [EDocumentType.NationalId]: "National ID",
}

export const DOCUMENT_TIPS = [
  "All four corners visible",
  "No glare or blur on the text",
  "Document is valid and not expired",
]
