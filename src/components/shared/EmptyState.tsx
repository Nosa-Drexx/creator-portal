import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: IconSvgElement
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
  compact?: boolean
}

export function EmptyState({ icon, title, description, action, className, compact }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex animate-rise flex-col items-center justify-center text-center",
        compact ? "gap-3 px-6 py-10" : "gap-4 px-6 py-16",
        className,
      )}
    >
      <div className="relative grid size-14 place-items-center rounded-2xl border border-stroke bg-surface text-text-secondary shadow-card">
        <HugeiconsIcon icon={icon} size={24} />
        <span className="absolute -inset-2 -z-10 rounded-[20px] bg-brand-soft blur-xl" aria-hidden />
      </div>
      <div className="flex max-w-sm flex-col gap-1.5">
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        {description && <p className="text-sm leading-relaxed text-text-secondary">{description}</p>}
      </div>
      {action && <div className="mt-1 flex flex-wrap items-center justify-center gap-2">{action}</div>}
    </div>
  )
}
