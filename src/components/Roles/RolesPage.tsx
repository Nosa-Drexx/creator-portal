"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Shield01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { StaggerGroup, StaggerItem } from "@/components/shared/motion/Stagger"
import { CanManage, RequirePermission } from "@/components/shared/Permissions"
import { EModule } from "@/constants/permissions"
import { useRoles } from "@/hooks/queries/use-members"
import type { RoleSummary } from "@/types/members"
import { RoleCard } from "./RoleCard"
import { RoleEditor } from "./RoleEditor"
import { RolesSkeleton } from "./RolesSkeleton"

function RolesContent() {
  const { data, isPending, error, refetch, isRefetching } = useRoles()
  const [editor, setEditor] = useState<{ open: boolean; role: RoleSummary | null }>({ open: false, role: null })

  const open = (role: RoleSummary | null) => setEditor({ open: true, role })

  if (isPending) return <RolesSkeleton />
  if (error) return <ErrorState error={error} title="We couldn't load roles" onRetry={refetch} isRetrying={isRefetching} />

  const builtIn = data.filter((r) => r.systemKey)
  const custom = data.filter((r) => !r.systemKey)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex animate-rise flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-[13px] text-text-secondary">
          Roles decide what each member can see and do in this workspace. Built-in roles can&apos;t be edited; duplicate
          one to customise it.
        </p>
        <CanManage module={EModule.Roles}>
          <Button onClick={() => open(null)} className="max-sm:w-full">
            <HugeiconsIcon icon={Add01Icon} size={16} />
            Create role
          </Button>
        </CanManage>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-text-tertiary">Built-in roles</h3>
        <StaggerGroup className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 [&>*]:min-w-0">
          {builtIn.map((role) => (
            <StaggerItem key={role.id} className="h-full">
              <RoleCard role={role} onOpen={open} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-text-tertiary">Custom roles</h3>
        {custom.length === 0 ? (
          <div className="rounded-2xl bg-surface shadow-card">
            <EmptyState
              compact
              icon={Shield01Icon}
              title="No custom roles yet"
              description="Create a role with exactly the permissions your team needs, or duplicate a built-in role."
            />
          </div>
        ) : (
          <StaggerGroup className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 [&>*]:min-w-0">
            {custom.map((role) => (
              <StaggerItem key={role.id} className="h-full">
                <RoleCard role={role} onOpen={open} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </section>

      <RoleEditor
        open={editor.open}
        role={editor.role}
        onOpenChange={(value) => setEditor((s) => ({ ...s, open: value }))}
      />
    </div>
  )
}

export function RolesPage() {
  return (
    <RequirePermission module={EModule.Members} fallback={<RolesSkeleton />}>
      <RolesContent />
    </RequirePermission>
  )
}
