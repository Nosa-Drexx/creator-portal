"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { EAction, EModule, ESystemRole } from "@/constants/permissions"
import { useChangeMemberRole } from "@/hooks/mutations/use-member-mutations"
import { usePermissions } from "@/hooks/use-permissions"
import { cn } from "@/lib/utils"
import type { Member, RoleSummary } from "@/types/members"

interface RoleSelectProps {
  member: Member
  roles: RoleSummary[]
  className?: string
}

/** Inline role changer for managers; a plain badge for everyone else */
export function RoleSelect({ member, roles, className }: RoleSelectProps) {
  const { can } = usePermissions()
  const change = useChangeMemberRole()
  const isOwnerRole = member.role.systemKey === ESystemRole.Owner
  // The owner's role is fixed, and nobody edits their own role (mirrors the API)
  const editable = can(EAction.Manage, EModule.Members) && !isOwnerRole && !member.isYou
  const assignable = roles.filter((role) => role.systemKey !== ESystemRole.Owner)

  if (!editable) {
    return <StatusBadge tone={isOwnerRole ? "brand" : "neutral"} label={member.role.name} dot={false} className={className} />
  }

  return (
    <Select
      value={member.role.id}
      disabled={change.isPending}
      onValueChange={(roleId) => roleId !== member.role.id && change.mutate({ memberId: member.id, roleId })}
    >
      <SelectTrigger
        aria-label={`Role for ${member.user.name}`}
        className={cn(
          "h-8 w-[150px] gap-1.5 rounded-lg border-stroke-strong bg-surface px-2.5 text-[13px] font-medium",
          change.isPending && "opacity-60",
          className,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="end" className="rounded-xl">
        {assignable.map((role) => (
          <SelectItem key={role.id} value={role.id} className="rounded-lg">
            {role.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
