"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, RefreshIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { getApiErrorMessage } from "@/lib/axios"
import { cn } from "@/lib/utils"

interface ErrorStateProps {
  error?: unknown
  title?: string
  onRetry?: () => void
  isRetrying?: boolean
  className?: string
  compact?: boolean
}

export function ErrorState({
  error,
  title = "We couldn't load this",
  onRetry,
  isRetrying,
  className,
  compact,
}: ErrorStateProps) {
  const message = getApiErrorMessage(error, "Something went wrong while loading. Please try again.")

  return (
    <div
      role="alert"
      className={cn(
        "flex animate-rise flex-col items-center justify-center gap-3 text-center",
        compact ? "px-6 py-8" : "px-6 py-14",
        className,
      )}
    >
      <div className="grid size-11 place-items-center rounded-full bg-danger-surface text-danger">
        <HugeiconsIcon icon={Alert02Icon} size={20} />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="text-sm text-text-secondary">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} isLoading={isRetrying} className="mt-1">
          <HugeiconsIcon icon={RefreshIcon} size={14} />
          Try again
        </Button>
      )}
    </div>
  )
}
