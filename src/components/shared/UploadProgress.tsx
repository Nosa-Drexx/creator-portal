"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, RefreshIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import type { UploadState } from "@/hooks/use-file-upload"
import { formatBytes } from "@/lib/format"
import { cn } from "@/lib/utils"

interface UploadProgressProps {
  state: UploadState
  onCancel?: () => void
  onRetry?: () => void
  className?: string
}

function eta(state: UploadState) {
  if (!state.bytesPerSecond || state.loaded === 0) return "Starting…"
  const seconds = Math.max(0, Math.round((state.total - state.loaded) / state.bytesPerSecond))
  if (seconds < 1) return "Finishing…"
  return seconds < 60 ? `${seconds}s left` : `${Math.ceil(seconds / 60)} min left`
}

export function UploadProgress({ state, onCancel, onRetry, className }: UploadProgressProps) {
  const failed = state.status === "error"

  return (
    <div className={cn("flex flex-col gap-2", className)} aria-live="polite">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className={cn("font-semibold tabular", failed ? "text-danger" : "text-text-primary")}>
          {failed ? "Upload failed" : state.status === "success" ? "Uploaded" : `${state.progress}%`}
        </span>
        {state.status === "uploading" && (
          <span className="text-text-tertiary tabular">
            {formatBytes(state.loaded)} of {formatBytes(state.total)} · {eta(state)}
          </span>
        )}
      </div>
      <div
        role="progressbar"
        aria-valuenow={state.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        className="relative h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-[width] duration-300 ease-out-soft",
            failed ? "bg-danger" : "bg-brand",
          )}
          style={{ width: `${failed ? 100 : state.progress}%` }}
        />
        {state.status === "uploading" && (
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/50 to-transparent" />
        )}
      </div>
      {failed && <p className="text-xs text-danger">{state.error}</p>}
      {(state.status === "uploading" || failed) && (
        <div className="flex gap-2">
          {state.status === "uploading" && onCancel && (
            <Button type="button" variant="ghost" size="xs" onClick={onCancel}>
              <HugeiconsIcon icon={Cancel01Icon} size={13} />
              Cancel
            </Button>
          )}
          {failed && onRetry && (
            <Button type="button" variant="outline" size="xs" onClick={onRetry}>
              <HugeiconsIcon icon={RefreshIcon} size={13} />
              Retry upload
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
