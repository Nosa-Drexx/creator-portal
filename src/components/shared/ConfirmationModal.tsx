"use client"

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { Delete02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ResponsiveModal } from "./ResponsiveModal"

interface ConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: React.ReactNode
  confirmLabel?: string
  onConfirm: () => void
  isLoading?: boolean
  variant?: "destructive" | "default"
  icon?: IconSvgElement
  children?: React.ReactNode
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  isLoading = false,
  variant = "destructive",
  icon = Delete02Icon,
  children,
}: ConfirmationModalProps) {
  const destructive = variant === "destructive"

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      isPerformingAction={isLoading}
      title={
        <span className="flex items-center gap-3">
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-full",
              destructive ? "bg-danger-surface text-danger" : "bg-brand-soft text-brand",
            )}
          >
            <HugeiconsIcon icon={icon} size={18} />
          </span>
          {title}
        </span>
      }
      description={description}
      footer={
        <>
          <Button variant="outline" size="lg" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={onConfirm}
            isLoading={isLoading}
            className={cn(destructive && "bg-danger text-white hover:bg-danger/90")}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </ResponsiveModal>
  )
}
