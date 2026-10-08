"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { SquareLock02Icon } from "@hugeicons/core-free-icons"
import { Checkbox } from "@/components/ui/checkbox"
import { PERMISSION_GROUPS, type Permission } from "@/constants/permissions"
import { usePermissions } from "@/hooks/use-permissions"
import { cn } from "@/lib/utils"

interface PermissionsPickerProps {
  value: string[]
  onChange: (value: string[]) => void
  readOnly?: boolean
}

/** Grouped permission matrix; permissions the viewer lacks can't be granted (server enforces this too) */
export function PermissionsPicker({ value, onChange, readOnly }: PermissionsPickerProps) {
  const { has } = usePermissions()
  const selected = new Set(value)

  const toggle = (code: string, on: boolean) => {
    const next = new Set(selected)
    if (on) next.add(code)
    else next.delete(code)
    onChange([...next])
  }

  return (
    <div className="flex flex-col gap-3">
      {PERMISSION_GROUPS.map((group) => {
        const codes = group.permissions.map((p) => p.code)
        const grantable = codes.filter((c) => has(c))
        const granted = codes.filter((c) => selected.has(c)).length
        const allGranted = grantable.length > 0 && grantable.every((c) => selected.has(c))

        const toggleGroup = () => {
          const next = new Set(selected)
          grantable.forEach((c) => (allGranted ? next.delete(c) : next.add(c)))
          onChange([...next])
        }

        return (
          <section key={group.module} className="overflow-hidden rounded-xl border border-stroke bg-surface">
            <header className="flex items-center justify-between gap-3 border-b border-stroke bg-muted/40 px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold">{group.label}</span>
                <span className="rounded-full bg-ink-200/70 px-1.5 text-[10.5px] font-semibold tabular text-text-secondary dark:bg-ink-800">
                  {granted}/{codes.length}
                </span>
              </div>
              {!readOnly && grantable.length > 0 && (
                <button
                  type="button"
                  onClick={toggleGroup}
                  className="rounded-md px-1.5 py-1 text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary"
                >
                  {allGranted ? "Clear" : "Select all"}
                </button>
              )}
            </header>
            <ul className="divide-y divide-stroke">
              {group.permissions.map((permission) => {
                const locked = !has(permission.code as Permission)
                const disabled = readOnly || locked
                const checked = selected.has(permission.code)
                const id = `perm-${permission.code.replace(":", "-")}`
                return (
                  <li key={permission.code}>
                    <label
                      htmlFor={id}
                      className={cn(
                        "flex min-h-14 items-center gap-3 px-3.5 py-2.5 transition-colors",
                        disabled ? "cursor-default" : "cursor-pointer hover:bg-muted/40",
                      )}
                    >
                      <Checkbox
                        id={id}
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(v) => toggle(permission.code, v === true)}
                        className="size-[18px]"
                      />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className={cn("text-[13.5px] font-medium", disabled && !checked && "text-text-tertiary")}>
                          {permission.label}
                        </span>
                        <span className="text-xs text-text-tertiary">
                          {locked && !readOnly ? "You don't have this permission, so you can't grant it" : permission.description}
                        </span>
                      </span>
                      {locked && !readOnly && (
                        <HugeiconsIcon icon={SquareLock02Icon} size={14} className="shrink-0 text-text-tertiary" />
                      )}
                    </label>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
