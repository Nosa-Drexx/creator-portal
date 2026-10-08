import type { BadgeTone } from "@/components/shared/StatusBadge"
import { EContentStatus } from "@/enums/content"
import { EPurchaseStatus } from "@/enums/purchases"
import { EVerificationStatus } from "@/enums/verification"

export const CONTENT_STATUS: Record<EContentStatus, { label: string; tone: BadgeTone }> = {
  [EContentStatus.Published]: { label: "Published", tone: "success" },
  [EContentStatus.Scheduled]: { label: "Scheduled", tone: "info" },
  [EContentStatus.Draft]: { label: "Draft", tone: "neutral" },
}

export const PURCHASE_STATUS: Record<EPurchaseStatus, { label: string; tone: BadgeTone }> = {
  [EPurchaseStatus.Completed]: { label: "Completed", tone: "success" },
  [EPurchaseStatus.Pending]: { label: "Pending", tone: "warning" },
  [EPurchaseStatus.Refunded]: { label: "Refunded", tone: "neutral" },
  [EPurchaseStatus.Failed]: { label: "Failed", tone: "danger" },
}

export const VERIFICATION_STATUS: Record<EVerificationStatus, { label: string; tone: BadgeTone }> = {
  [EVerificationStatus.Verified]: { label: "Verified", tone: "success" },
  [EVerificationStatus.Pending]: { label: "In review", tone: "warning" },
  [EVerificationStatus.Unverified]: { label: "Not verified", tone: "neutral" },
  [EVerificationStatus.Rejected]: { label: "Rejected", tone: "danger" },
}
