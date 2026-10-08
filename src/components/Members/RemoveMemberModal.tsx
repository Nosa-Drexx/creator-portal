"use client"

import { useRouter } from "next/navigation"
import { Logout03Icon, UserRemove01Icon } from "@hugeicons/core-free-icons"
import { ConfirmationModal } from "@/components/shared/ConfirmationModal"
import { useRemoveMember } from "@/hooks/mutations/use-member-mutations"
import { useWorkspace } from "@/hooks/queries/use-workspace"
import { customToast } from "@/hooks/use-toast"
import type { Member } from "@/types/members"

interface RemoveMemberModalProps {
  member: Member | null
  onClose: () => void
}

export function RemoveMemberModal({ member, onClose }: RemoveMemberModalProps) {
  const router = useRouter()
  const remove = useRemoveMember()
  const { data: workspace } = useWorkspace()
  const leaving = !!member?.isYou

  return (
    <ConfirmationModal
      open={!!member}
      onOpenChange={(open) => !open && onClose()}
      icon={leaving ? Logout03Icon : UserRemove01Icon}
      title={leaving ? "Leave this workspace?" : `Remove ${member?.user.name ?? "member"}?`}
      description={
        leaving
          ? `You'll lose access to ${workspace?.name ?? "this workspace"} immediately. Someone will need to invite you again to rejoin.`
          : `${member?.user.name ?? "They"} will lose access to ${workspace?.name ?? "this workspace"} straight away. Their uploads stay in the workspace.`
      }
      confirmLabel={leaving ? "Leave workspace" : "Remove member"}
      isLoading={remove.isPending}
      onConfirm={() =>
        member &&
        remove.mutate(member.id, {
          onSuccess: () => {
            onClose()
            if (leaving) {
              customToast("success", `You left ${workspace?.name ?? "the workspace"}`)
              router.replace("/")
            } else {
              customToast("success", `${member.user.name} was removed`)
            }
          },
        })
      }
    />
  )
}
