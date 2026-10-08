"use client"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, UserIcon } from "@hugeicons/core-free-icons"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { VERIFICATION_STATUS } from "@/constants/status"
import { EVerificationStatus } from "@/enums/verification"
import { EAction, EModule } from "@/constants/permissions"
import { usePermissions } from "@/hooks/use-permissions"
import { SESSION_QUERY_KEY } from "@/hooks/queries/use-session"
import { useVerification } from "@/hooks/queries/use-verification"
import { WORKSPACE_QUERY_KEY } from "@/hooks/queries/use-workspace"
import { SubmittedState } from "./SubmittedState"
import { VerificationIntro } from "./VerificationIntro"
import { VerificationSkeleton } from "./VerificationSkeleton"
import { VerificationWizard } from "./VerificationWizard"
import { VerifiedState } from "./VerifiedState"

/** Unlocks the sidebar/banner as soon as polling sees the review complete */
function useApprovalSync(status: EVerificationStatus | undefined) {
  const queryClient = useQueryClient()
  const [previous, setPrevious] = useState(status)
  const [justApproved, setJustApproved] = useState(false)

  if (status !== previous) {
    setPrevious(status)
    if (previous === EVerificationStatus.Pending && status === EVerificationStatus.Verified) setJustApproved(true)
  }

  useEffect(() => {
    if (!justApproved) return
    queryClient.invalidateQueries({ queryKey: [...WORKSPACE_QUERY_KEY] })
    queryClient.invalidateQueries({ queryKey: [...SESSION_QUERY_KEY] })
  }, [justApproved, queryClient])

  return justApproved
}

export function VerificationPage() {
  const { can } = usePermissions()
  const { data: verification, isPending, error, refetch, isRefetching } = useVerification()
  const justApproved = useApprovalSync(verification?.status)

  if (isPending) return <VerificationSkeleton />
  if (error || !verification) {
    return <ErrorState error={error} title="We couldn't load your verification" onRetry={refetch} isRetrying={isRefetching} />
  }

  const status = verification.status
  const badge = VERIFICATION_STATUS[status]
  const isOwner = can(EAction.Manage, EModule.Verification)
  const showWizard = status === EVerificationStatus.Unverified || status === EVerificationStatus.Rejected

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title="Identity verification"
        description="Verified creators can publish videos and receive payouts. It takes about two minutes."
        actions={<StatusBadge tone={badge.tone} label={badge.label} pulse={status === EVerificationStatus.Pending} />}
      />

      {status === EVerificationStatus.Verified && !justApproved ? (
        <VerifiedState verification={verification} />
      ) : !showWizard ? (
        <SubmittedState verification={verification} />
      ) : !isOwner ? (
        <div className="rounded-2xl bg-surface shadow-card">
          <EmptyState
            icon={UserIcon}
            title="Only the workspace owner can verify"
            description="Identity checks are tied to the person who receives payouts. Ask the owner of this workspace to complete verification."
          />
        </div>
      ) : (
        <>
          <VerificationIntro />
          {status === EVerificationStatus.Rejected && (
            <p className="flex items-center gap-2 rounded-xl border border-danger-stroke bg-danger-surface px-4 py-3 text-sm text-danger">
              <HugeiconsIcon icon={Alert02Icon} size={16} />
              We couldn&apos;t verify your last submission. Please check your details and try again.
            </p>
          )}
          <div className="rounded-2xl bg-surface p-4 shadow-card sm:p-6">
            <VerificationWizard />
          </div>
        </>
      )}
    </div>
  )
}
