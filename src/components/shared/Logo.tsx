import { cn } from "@/lib/utils"

export function Logo({ className, wordmark = true }: { className?: string; wordmark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative grid size-8 place-items-center rounded-[10px] bg-ink-900 text-ink-0 shadow-[inset_0_1px_0_rgb(255_255_255/0.15)] dark:bg-ink-50 dark:text-ink-900">
        <svg viewBox="0 0 16 16" className="size-3.5 translate-x-px" aria-hidden>
          <path d="M4 2.8v10.4a.8.8 0 0 0 1.2.7l8.4-5.2a.8.8 0 0 0 0-1.4L5.2 2.1a.8.8 0 0 0-1.2.7Z" fill="currentColor" />
        </svg>
        <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-brand ring-2 ring-canvas" />
      </span>
      {wordmark && (
        <span className="text-[15px] font-bold tracking-tight">
          CreatorHub <span className="font-medium text-text-tertiary">Studio</span>
        </span>
      )}
    </span>
  )
}
