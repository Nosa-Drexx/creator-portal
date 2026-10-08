import { EContentStatus } from "@/enums/content"
import { EVerificationStatus } from "@/enums/verification"
import { Errors } from "@/server/lib/errors"

/** The core business rule: only verified creators can make content public */
export function canPublish(verificationStatus: EVerificationStatus) {
  return verificationStatus === EVerificationStatus.Verified
}

export function requiresVerification(status: EContentStatus) {
  return status === EContentStatus.Published || status === EContentStatus.Scheduled
}

export function assertCanSetStatus(
  verificationStatus: EVerificationStatus,
  nextStatus: EContentStatus,
) {
  if (requiresVerification(nextStatus) && !canPublish(verificationStatus)) {
    throw Errors.verificationRequired()
  }
}
