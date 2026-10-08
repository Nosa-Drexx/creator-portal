"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { SquareLock02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { routes } from "@/constants/routes"
import { EVerificationStatus } from "@/enums/verification"
import { useWorkspace } from "@/hooks/queries/use-workspace"
import { EAction, EModule } from "@/constants/permissions"
import { usePermissions } from "@/hooks/use-permissions"

/** Sidebar nudge shown until the workspace can publish */
export function VerifyCallout() {
  const { data: workspace } = useWorkspace()
  const { can } = usePermissions()
  if (!workspace || workspace.verificationStatus === EVerificationStatus.Verified) return null
  if (!can(EAction.View, EModule.Verification)) return null
  const pending = workspace.verificationStatus === EVerificationStatus.Pending
  const canSubmit = can(EAction.Manage, EModule.Verification)

  return (
    <div className="flex animate-rise flex-col gap-3 rounded-xl border border-stroke bg-surface p-3.5 shadow-card collapsed:hidden">
      <div className="flex items-center gap-2 text-text-primary">
        <span className="grid size-7 place-items-center rounded-lg bg-warning-surface text-warning">
          <HugeiconsIcon icon={SquareLock02Icon} size={15} />
        </span>
        <span className="text-[13px] font-semibold">{pending ? "Review in progress" : "Publishing locked"}</span>
      </div>
      <p className="text-xs leading-relaxed text-text-secondary">
        {pending
          ? "We're checking your details. Publishing unlocks as soon as you're approved."
          : canSubmit
            ? "Verify your identity to publish and start earning. Drafts are always available."
            : "The workspace owner needs to verify before anything can be published."}
      </p>
      {!pending && canSubmit && (
        <Button asChild size="sm" variant="default" className="w-full">
          <Link href={routes.verification(workspace.slug)}>Verify identity</Link>
        </Button>
      )}
    </div>
  )
}
