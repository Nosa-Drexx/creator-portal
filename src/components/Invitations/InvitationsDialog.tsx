"use client"

import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { useMyInvitations } from "@/hooks/queries/use-members"
import { InvitationList } from "./InvitationList"

interface InvitationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvitationsDialog({ open, onOpenChange }: InvitationsDialogProps) {
  const { data = [] } = useMyInvitations()

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Workspace invitations"
      description="Join a workspace to see and work on its videos with the role you've been given."
      className="pb-6"
    >
      {data.length ? (
        <InvitationList invitations={data} />
      ) : (
        <p className="py-6 text-center text-sm text-text-secondary">You&apos;re all caught up. No pending invitations.</p>
      )}
    </ResponsiveModal>
  )
}
