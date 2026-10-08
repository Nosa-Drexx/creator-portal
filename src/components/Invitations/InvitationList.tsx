"use client"

import { Button } from "@/components/ui/button"
import { WorkspaceAvatar } from "@/components/shared/WorkspaceAvatar"
import { useRespondToInvitation } from "@/hooks/mutations/use-member-mutations"
import type { MyInvitation } from "@/types/members"

export function InvitationList({ invitations }: { invitations: MyInvitation[] }) {
  const { accept, decline } = useRespondToInvitation()

  return (
    <ul className="flex flex-col gap-2">
      {invitations.map((invite) => {
        const accepting = accept.isPending && accept.variables === invite.id
        const declining = decline.isPending && decline.variables === invite.id
        return (
          <li key={invite.id} className="flex animate-rise flex-col gap-3 rounded-xl border border-stroke bg-surface p-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <WorkspaceAvatar name={invite.workspace.name} color={invite.workspace.accentColor} className="size-9 rounded-xl" />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold">{invite.workspace.name}</span>
                <span className="truncate text-xs text-text-tertiary">
                  {invite.invitedBy} invited you as <span className="font-medium text-text-secondary">{invite.role.name}</span>
                </span>
              </div>
            </div>
            <div className="flex gap-2 max-sm:[&>*]:flex-1">
              <Button size="sm" variant="ghost" onClick={() => decline.mutate(invite.id)} isLoading={declining} disabled={accepting}>
                Decline
              </Button>
              <Button size="sm" onClick={() => accept.mutate(invite.id)} isLoading={accepting} disabled={declining}>
                Accept
              </Button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
