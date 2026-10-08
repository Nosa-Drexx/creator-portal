"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Logout03Icon, MoreHorizontalIcon, UserRemove01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EAction, EModule, ESystemRole, MANAGE_ALL } from "@/constants/permissions"
import { usePermissions } from "@/hooks/use-permissions"
import type { Member } from "@/types/members"

interface MemberActionsMenuProps {
  member: Member
  onRemove: (member: Member) => void
}

export function MemberActionsMenu({ member, onRemove }: MemberActionsMenuProps) {
  const { can, has } = usePermissions()
  const isOwner = member.role.systemKey === ESystemRole.Owner
  const canRemove = !member.isYou && can(EAction.Manage, EModule.Members) && (!isOwner || has(MANAGE_ALL))

  if (!member.isYou && !canRemove) return <span className="block size-8" aria-hidden />

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${member.user.name}`}>
          <HugeiconsIcon icon={MoreHorizontalIcon} size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5">
        <DropdownMenuItem variant="destructive" className="gap-2.5 rounded-lg" onSelect={() => onRemove(member)}>
          <HugeiconsIcon icon={member.isYou ? Logout03Icon : UserRemove01Icon} size={16} />
          {member.isYou ? "Leave workspace" : "Remove from workspace"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
