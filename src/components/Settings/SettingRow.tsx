import { cn } from "@/lib/utils"

interface SettingRowProps {
  title: string
  description: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function SettingRow({ title, description, children, className }: SettingRowProps) {
  return (
    <div className={cn("flex flex-col gap-3 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between md:gap-8", className)}>
      <div className="flex max-w-md flex-col gap-0.5">
        <span className="text-[13.5px] font-semibold text-text-primary">{title}</span>
        <span className="text-[13px] leading-relaxed text-text-secondary">{description}</span>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}
