import type { EDocumentType, EVerificationStatus } from "@/enums/verification"

export interface Verification {
  status: EVerificationStatus
  fullName: string | null
  dateOfBirth: string | null
  country: string | null
  phone: string | null
  address: string | null
  documentType: EDocumentType | null
  documentKey: string | null
  selfieKey: string | null
  submittedAt: string | null
  reviewedAt: string | null
  /** When a pending review is expected to complete (demo review timer) */
  estimatedReviewAt: string | null
}

export interface VerificationPayload {
  fullName: string
  dateOfBirth: string
  country: string
  phone: string
  address: string
  documentType: EDocumentType
  documentKey: string
  selfieKey: string
}
