import { UserAvatar } from "@/components/shared/UserAvatar"
import type { Member } from "@/types/members"

export function MemberIdentity({ member }: { member: Member }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <UserAvatar name={member.user.name} avatarUrl={member.user.avatarUrl} className="size-9" />
      <div className="flex min-w-0 flex-col">
        <span className="flex items-center gap-1.5 truncate text-[13.5px] font-semibold text-text-primary">
          <span className="truncate">{member.user.name}</span>
          {member.isYou && (
            <span className="shrink-0 rounded-[5px] bg-brand-soft px-1.5 py-px text-[10px] font-bold text-brand">You</span>
          )}
        </span>
        <span className="truncate text-xs text-text-tertiary">{member.user.email}</span>
      </div>
    </div>
  )
}
