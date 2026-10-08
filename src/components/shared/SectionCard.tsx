import { cn } from "@/lib/utils"

interface SectionCardProps {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}

export function SectionCard({ title, description, actions, children, className, bodyClassName }: SectionCardProps) {
  return (
    <section className={cn("flex flex-col rounded-2xl bg-surface shadow-card", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
          <div className="flex min-w-0 flex-col gap-0.5">
            {title && <h2 className="text-[15px] font-semibold text-text-primary">{title}</h2>}
            {description && <p className="text-[13px] text-text-secondary">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={cn("flex flex-1 flex-col", bodyClassName)}>{children}</div>
    </section>
  )
}
