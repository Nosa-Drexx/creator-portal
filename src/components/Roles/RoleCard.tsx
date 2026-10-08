"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, UserIcon } from "@hugeicons/core-free-icons"
import { StatusBadge } from "@/components/shared/StatusBadge"
import type { RoleSummary } from "@/types/members"
import { isAllPermissions, isBuiltIn, permissionLabel, permissionSummary } from "./role-utils"

const VISIBLE_CHIPS = 3

export function RoleCard({ role, onOpen }: { role: RoleSummary; onOpen: (role: RoleSummary) => void }) {
  const chips = isAllPermissions(role.permissions) ? [] : role.permissions.slice(0, VISIBLE_CHIPS)
  const extra = role.permissions.length - chips.length

  return (
    <button
      type="button"
      onClick={() => onOpen(role)}
      className="group flex h-full w-full flex-col gap-3 rounded-2xl bg-surface p-4 text-left shadow-card transition-[box-shadow,transform] duration-200 ease-out-soft outline-none hover:-translate-y-0.5 hover:shadow-float focus-visible:ring-3 focus-visible:ring-ring/40 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-[15px] font-semibold text-text-primary">{role.name}</span>
          <StatusBadge
            tone={isBuiltIn(role) ? "neutral" : "brand"}
            label={isBuiltIn(role) ? "Built-in" : "Custom"}
            dot={false}
            className="h-5 px-2 text-[10.5px]"
          />
        </div>
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={16}
          className="mt-1 shrink-0 text-text-tertiary transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </div>
      <p className="line-clamp-2 text-[13px] text-text-secondary">{role.description || "No description"}</p>
      {(chips.length > 0 || isAllPermissions(role.permissions)) && (
        <div className="flex flex-wrap gap-1.5">
          {isAllPermissions(role.permissions) ? (
            <span className="rounded-md bg-brand-soft px-2 py-0.5 text-[11.5px] font-medium text-brand">Full access</span>
          ) : (
            chips.map((code) => (
              <span key={code} className="rounded-md bg-muted px-2 py-0.5 text-[11.5px] font-medium text-text-secondary">
                {permissionLabel(code)}
              </span>
            ))
          )}
          {extra > 0 && !isAllPermissions(role.permissions) && (
            <span className="rounded-md px-1.5 py-0.5 text-[11.5px] font-medium text-text-tertiary">+{extra}</span>
          )}
        </div>
      )}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-stroke pt-3 text-xs text-text-tertiary">
        <span className="inline-flex items-center gap-1.5">
          <HugeiconsIcon icon={UserIcon} size={13} />
          {role.memberCount} {role.memberCount === 1 ? "member" : "members"}
        </span>
        <span>{permissionSummary(role.permissions)}</span>
      </div>
    </button>
  )
}
