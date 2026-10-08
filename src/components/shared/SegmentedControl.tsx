"use client"

import { useId } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { SPRING_SNAPPY } from "./motion/easing"

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: React.ReactNode; count?: number }[]
  value: T
  onChange: (value: T) => void
  className?: string
  size?: "sm" | "md"
  "aria-label": string
}

/** Pill tabs with a sliding indicator */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "md",
  ...props
}: SegmentedControlProps<T>) {
  const id = useId()

  return (
    <div
      role="tablist"
      aria-label={props["aria-label"]}
      className={cn("inline-flex shrink-0 items-center gap-0.5 rounded-[11px] bg-muted p-[3px]", className)}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-[13px]",
              active ? "text-text-primary" : "text-text-tertiary hover:text-text-secondary",
            )}
          >
            {active && (
              <motion.span
                layoutId={`segment-${id}`}
                transition={SPRING_SNAPPY}
                className="absolute inset-0 rounded-lg bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.06),0_0_0_1px_var(--stroke)]"
              />
            )}
            <span className="relative">{option.label}</span>
            {option.count !== undefined && (
              <span className="relative rounded-full bg-ink-200/70 px-1.5 text-[10.5px] tabular text-text-secondary dark:bg-ink-800">
                {option.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
