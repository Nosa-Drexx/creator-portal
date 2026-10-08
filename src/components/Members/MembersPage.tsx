"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon, UserAdd01Icon, UserGroupIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { CanManage, RequirePermission } from "@/components/shared/Permissions"
import { EAction, EModule } from "@/constants/permissions"
import { useMembers, useRoles } from "@/hooks/queries/use-members"
import { useIsMobile } from "@/hooks/use-mobile"
import { usePermissions } from "@/hooks/use-permissions"
import type { Member } from "@/types/members"
import { InviteMemberModal } from "./InviteMemberModal"
import { MemberCards } from "./MemberCards"
import { MembersSkeleton } from "./MembersSkeleton"
import { MembersTable } from "./MembersTable"
import { PendingInvitations } from "./PendingInvitations"
import { RemoveMemberModal } from "./RemoveMemberModal"

function MembersContent() {
  const isMobile = useIsMobile()
  const { can } = usePermissions()
  const members = useMembers()
  const roles = useRoles()
  const [inviting, setInviting] = useState(false)
  const [toRemove, setToRemove] = useState<Member | null>(null)
  const canManage = can(EAction.Manage, EModule.Members)

  if (members.isPending || roles.isPending) return <MembersSkeleton />

  const error = members.error ?? roles.error
  if (error) {
    return (
      <div className="rounded-2xl bg-surface shadow-card">
        <ErrorState
          error={error}
          title="We couldn't load your team"
          onRetry={() => {
            members.refetch()
            roles.refetch()
          }}
          isRetrying={members.isRefetching || roles.isRefetching}
        />
      </div>
    )
  }

  const list = members.data ?? []
  const roleList = roles.data ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex animate-rise flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-text-secondary">
            {list.length} {list.length === 1 ? "member" : "members"} in this workspace
          </p>
          {!canManage && (
            <p className="flex items-center gap-1.5 text-xs text-text-tertiary">
              <HugeiconsIcon icon={InformationCircleIcon} size={13} />
              Only admins can invite or change roles.
            </p>
          )}
        </div>
        <CanManage module={EModule.Members}>
          <Button onClick={() => setInviting(true)} className="max-sm:h-11 max-sm:w-full">
            <HugeiconsIcon icon={UserAdd01Icon} size={16} />
            Invite member
          </Button>
        </CanManage>
      </div>

      <section className="overflow-hidden rounded-2xl bg-surface shadow-card max-md:-mx-1">
        {list.length === 0 ? (
          <EmptyState
            icon={UserGroupIcon}
            title="It's just you so far"
            description="Invite collaborators to help upload, publish and track your videos."
          />
        ) : isMobile ? (
          <MemberCards members={list} roles={roleList} onRemove={setToRemove} />
        ) : (
          <MembersTable members={list} roles={roleList} onRemove={setToRemove} />
        )}
      </section>

      {canManage && <PendingInvitations />}

      <InviteMemberModal open={inviting} onOpenChange={setInviting} />
      <RemoveMemberModal member={toRemove} onClose={() => setToRemove(null)} />
    </div>
  )
}

export function MembersPage() {
  return (
    <RequirePermission module={EModule.Members} fallback={<MembersSkeleton />}>
      <MembersContent />
    </RequirePermission>
  )
}
