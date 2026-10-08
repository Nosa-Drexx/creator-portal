"use client"

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface DropdownSelectProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  /** Inline prefix inside the trigger, e.g. "Status:" */
  label?: string
  leadingIcon?: IconSvgElement
  triggerClassName?: string
  "aria-label": string
}

export function DropdownSelect<T extends string>({
  options,
  value,
  onChange,
  label,
  leadingIcon,
  triggerClassName,
  ...props
}: DropdownSelectProps<T>) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger
        aria-label={props["aria-label"]}
        className={cn(
          "h-10 gap-1.5 rounded-[10px] border-stroke-strong bg-surface px-3 text-[13px] font-medium shadow-[0_1px_1px_rgb(0_0_0/0.03)] sm:h-9",
          triggerClassName,
        )}
      >
        {leadingIcon && <HugeiconsIcon icon={leadingIcon} size={15} className="text-text-tertiary" />}
        {label && <span className="text-text-tertiary">{label}</span>}
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="end" className="rounded-xl">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="rounded-lg py-2">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
