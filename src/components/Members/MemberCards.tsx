"use client"

import { formatDate } from "@/lib/format"
import type { Member, RoleSummary } from "@/types/members"
import { MemberActionsMenu } from "./MemberActionsMenu"
import { MemberIdentity } from "./MemberIdentity"
import { RoleSelect } from "./RoleSelect"

interface MemberCardsProps {
  members: Member[]
  roles: RoleSummary[]
  onRemove: (member: Member) => void
}

/** Phone layout: identity on top, role control and join date on a thumb-friendly second row */
export function MemberCards({ members, roles, onRemove }: MemberCardsProps) {
  return (
    <ul className="flex flex-col divide-y divide-stroke">
      {members.map((member, index) => (
        <li
          key={member.id}
          className="flex animate-rise flex-col gap-3 p-4"
          style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
        >
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <MemberIdentity member={member} />
            </div>
            <MemberActionsMenu member={member} onRemove={onRemove} />
          </div>
          <div className="flex items-center justify-between gap-3 pl-12">
            <RoleSelect member={member} roles={roles} className="h-9 w-[160px]" />
            <span className="text-xs text-text-tertiary tabular">Joined {formatDate(member.joinedAt, "d MMM yyyy")}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
