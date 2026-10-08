"use client"

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { Calendar03Icon, File01Icon, FlashIcon, SquareLock02Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"
import { EContentStatus } from "@/enums/content"
import { cn } from "@/lib/utils"

interface Option {
  value: EContentStatus
  label: string
  hint: string
  icon: IconSvgElement
}

const OPTIONS: Option[] = [
  { value: EContentStatus.Draft, label: "Save as draft", hint: "Only you can see it", icon: File01Icon },
  { value: EContentStatus.Published, label: "Publish now", hint: "Available to buy immediately", icon: FlashIcon },
  { value: EContentStatus.Scheduled, label: "Schedule", hint: "Goes live at a set time", icon: Calendar03Icon },
]

interface PublishOptionsProps {
  value: EContentStatus
  onChange: (value: EContentStatus) => void
  scheduledFor: string
  onScheduledForChange: (value: string) => void
  scheduleError?: string
  canPublish: boolean
  lockReason?: "permission" | "verification" | null
  onLockedSelect: (value: EContentStatus) => void
}

export function PublishOptions({
  value,
  onChange,
  scheduledFor,
  onScheduledForChange,
  scheduleError,
  canPublish,
  lockReason,
  onLockedSelect,
}: PublishOptionsProps) {
  const lockedHint = lockReason === "permission" ? "Your role can't publish" : "Requires identity verification"
  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" aria-label="Visibility" className="grid gap-2">
        {OPTIONS.map((option) => {
          const selected = option.value === value
          const locked = !canPublish && option.value !== EContentStatus.Draft
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => (locked ? onLockedSelect(option.value) : onChange(option.value))}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 text-left transition-[border-color,background-color,box-shadow] duration-200 ease-out-soft outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                selected
                  ? "border-brand bg-brand-soft shadow-[0_0_0_1px_var(--brand)]"
                  : "border-stroke bg-surface hover:border-stroke-strong",
              )}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg transition-colors",
                  selected ? "bg-brand text-brand-foreground" : "bg-muted text-text-secondary",
                )}
              >
                <HugeiconsIcon icon={option.icon} size={16} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[13.5px] font-semibold text-text-primary">{option.label}</span>
                <span className="text-xs text-text-tertiary">{locked ? lockedHint : option.hint}</span>
              </span>
              {locked ? (
                <HugeiconsIcon icon={SquareLock02Icon} size={16} className="shrink-0 text-text-tertiary" />
              ) : (
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
                    selected ? "border-brand bg-brand text-brand-foreground" : "border-stroke-strong",
                  )}
                >
                  {selected && <HugeiconsIcon icon={Tick02Icon} size={12} strokeWidth={3} className="animate-pop" />}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out-soft",
          value === EContentStatus.Scheduled ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <label className="flex flex-col gap-1.5 pt-1">
            <span className="text-[13px] font-medium text-text-secondary">Publish on</span>
            <Input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => onScheduledForChange(e.target.value)}
              aria-invalid={!!scheduleError}
              className="h-10"
            />
            {scheduleError && <span className="text-xs text-danger">{scheduleError}</span>}
          </label>
        </div>
      </div>
    </div>
  )
}
