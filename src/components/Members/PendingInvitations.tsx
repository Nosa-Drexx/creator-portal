"use client"

import { useState } from "react"
import { differenceInCalendarDays } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, Clock01Icon, Link01Icon, Mail01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { ConfirmationModal } from "@/components/shared/ConfirmationModal"
import { SectionCard } from "@/components/shared/SectionCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useCopyInvitationLink, useRevokeInvitation } from "@/hooks/mutations/use-member-mutations"
import { useWorkspaceInvitations } from "@/hooks/queries/use-members"
import type { WorkspaceInvitation } from "@/types/members"

function expiresIn(iso: string) {
  const days = differenceInCalendarDays(new Date(iso), new Date())
  return days <= 0 ? "Expires today" : `Expires in ${days} ${days === 1 ? "day" : "days"}`
}

/** Rendered only for people who can manage members; nothing when there are no open invites */
export function PendingInvitations() {
  const { data: invitations } = useWorkspaceInvitations()
  const revoke = useRevokeInvitation()
  const copyLink = useCopyInvitationLink()
  const [toRevoke, setToRevoke] = useState<WorkspaceInvitation | null>(null)

  if (!invitations?.length) return null

  return (
    <SectionCard
      title="Pending invitations"
      description="People who've been invited but haven't joined yet."
      className="animate-rise"
    >
      <ul className="flex flex-col divide-y divide-stroke px-2 py-1 sm:px-3">
        {invitations.map((invite) => (
          <li key={invite.id} className="flex items-center gap-3 px-2 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full border border-dashed border-stroke-strong text-text-tertiary">
              <HugeiconsIcon icon={Mail01Icon} size={16} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-[13.5px] font-semibold">{invite.email}</span>
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-tertiary">
                <StatusBadge tone="neutral" label={invite.role.name} dot={false} className="h-5 px-2 text-[10.5px]" />
                <span>Invited by {invite.invitedBy}</span>
                <span className="inline-flex items-center gap-1">
                  <HugeiconsIcon icon={Clock01Icon} size={12} />
                  {expiresIn(invite.expiresAt)}
                </span>
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyLink.mutate(invite.id)}
                isLoading={copyLink.isPending && copyLink.variables === invite.id}
                aria-label={`Copy invite link for ${invite.email}`}
              >
                <HugeiconsIcon icon={Link01Icon} size={14} />
                <span className="max-sm:sr-only">Copy link</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setToRevoke(invite)}
                aria-label={`Revoke invitation for ${invite.email}`}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
                <span className="max-sm:sr-only">Revoke</span>
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmationModal
        open={!!toRevoke}
        onOpenChange={(open) => !open && setToRevoke(null)}
        title="Revoke this invitation?"
        description={
          <>
            The link sent to <span className="font-semibold text-text-primary">{toRevoke?.email}</span> will stop
            working. You can invite them again later.
          </>
        }
        confirmLabel="Revoke invitation"
        icon={Cancel01Icon}
        isLoading={revoke.isPending}
        onConfirm={() => toRevoke && revoke.mutate(toRevoke.id, { onSuccess: () => setToRevoke(null) })}
      />
    </SectionCard>
  )
}
