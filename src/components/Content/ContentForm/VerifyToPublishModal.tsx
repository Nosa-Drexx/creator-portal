"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkBadge01Icon, File01Icon, Shield01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { EVerificationStatus } from "@/enums/verification"

interface VerifyToPublishModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  verificationStatus: EVerificationStatus
  onSaveDraft: () => void
  onVerify: () => void
  isSaving: boolean
}

const STEPS = [
  { icon: File01Icon, text: "Your video is kept safe as a draft" },
  { icon: Shield01Icon, text: "Verify your identity in about 2 minutes" },
  { icon: CheckmarkBadge01Icon, text: "Come back and publish with one click" },
]

/** Shown when an unverified creator tries to publish, client-side or after a 403 from the API */
export function VerifyToPublishModal({
  open,
  onOpenChange,
  verificationStatus,
  onSaveDraft,
  onVerify,
  isSaving,
}: VerifyToPublishModalProps) {
  const pending = verificationStatus === EVerificationStatus.Pending

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      isPerformingAction={isSaving}
      title={pending ? "Your verification is in review" : "Verify your identity to publish"}
      description={
        pending
          ? "Publishing unlocks automatically once your review is approved. Save your work as a draft for now."
          : "To protect buyers and pay you securely, creators verify their identity before content goes live."
      }
      footer={
        pending ? (
          <Button size="lg" onClick={onSaveDraft} isLoading={isSaving}>
            Save as draft
          </Button>
        ) : (
          <>
            <Button variant="outline" size="lg" onClick={onSaveDraft} disabled={isSaving}>
              Save as draft
            </Button>
            <Button size="lg" onClick={onVerify} isLoading={isSaving}>
              Save &amp; verify now
            </Button>
          </>
        )
      }
    >
      {!pending && (
        <ol className="flex flex-col gap-2.5 rounded-xl bg-muted/60 p-3.5">
          {STEPS.map((step, i) => (
            <li key={step.text} className="flex animate-rise items-center gap-3 text-[13.5px]" style={{ animationDelay: `${i * 70}ms` }}>
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-surface text-brand shadow-card">
                <HugeiconsIcon icon={step.icon} size={15} />
              </span>
              {step.text}
            </li>
          ))}
        </ol>
      )}
    </ResponsiveModal>
  )
}
