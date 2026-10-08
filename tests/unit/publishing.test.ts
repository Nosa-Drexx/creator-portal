import { describe, expect, it } from "vitest"
import { EContentStatus } from "@/enums/content"
import { EErrorCode } from "@/enums/errors"
import { EVerificationStatus } from "@/enums/verification"
import { assertCanSetStatus, canPublish } from "@/server/services/publishing"

describe("publishing rule", () => {
  it("only verified creators can publish", () => {
    expect(canPublish(EVerificationStatus.Verified)).toBe(true)
    for (const status of [EVerificationStatus.Unverified, EVerificationStatus.Pending, EVerificationStatus.Rejected]) {
      expect(canPublish(status)).toBe(false)
    }
  })

  it.each([EContentStatus.Published, EContentStatus.Scheduled])("blocks %s for unverified creators", (status) => {
    expect(() => assertCanSetStatus(EVerificationStatus.Pending, status)).toThrowError(
      expect.objectContaining({ code: EErrorCode.VerificationRequired, status: 403 }),
    )
  })

  it("always allows drafts", () => {
    expect(() => assertCanSetStatus(EVerificationStatus.Unverified, EContentStatus.Draft)).not.toThrow()
  })
})
