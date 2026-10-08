import { cn } from "@/lib/utils"

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral" | "brand"

const TONES: Record<BadgeTone, string> = {
  success: "bg-success-surface text-success border-success-stroke",
  warning: "bg-warning-surface text-warning border-warning-stroke",
  danger: "bg-danger-surface text-danger border-danger-stroke",
  info: "bg-info-surface text-info border-info-stroke",
  neutral: "bg-muted text-text-secondary border-stroke",
  brand: "bg-brand-soft text-brand border-brand/20",
}

interface StatusBadgeProps {
  tone: BadgeTone
  label: string
  dot?: boolean
  pulse?: boolean
  className?: string
}

export function StatusBadge({ tone, label, dot = true, pulse, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {dot && (
        <span className="relative flex size-1.5">
          {pulse && <span className="absolute inset-0 animate-ping-soft rounded-full bg-current" />}
          <span className="relative size-1.5 rounded-full bg-current" />
        </span>
      )}
      {label}
    </span>
  )
}
