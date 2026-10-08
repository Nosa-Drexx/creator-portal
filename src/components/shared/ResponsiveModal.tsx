"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface ResponsiveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  /** Blocks closing while a request is in flight */
  isPerformingAction?: boolean
  className?: string
}

/** Centered dialog on desktop, thumb-friendly bottom sheet on mobile */
export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  isPerformingAction = false,
  className,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile()
  const handleOpenChange = (value: boolean) => {
    if (isPerformingAction) return
    onOpenChange(value)
  }

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className="max-h-[92dvh] bg-surface">
          <DrawerHeader className="px-5 pt-3 text-left">
            <DrawerTitle className="text-lg font-semibold tracking-tight">{title}</DrawerTitle>
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
          <div className={cn("min-w-0 overflow-y-auto px-5", className)}>{children}</div>
          {footer && (
            <div className="flex flex-col-reverse gap-2 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] [&>*]:h-11 [&>*]:w-full">
              {footer}
            </div>
          )}
        </DrawerContent>
      </Drawer>
    )
  }

  // Grid children default to min-width:auto; [&>*]:min-w-0 stops long unbreakable text (URLs) widening the dialog
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!isPerformingAction}
        onInteractOutside={(e) => isPerformingAction && e.preventDefault()}
        onEscapeKeyDown={(e) => isPerformingAction && e.preventDefault()}
        className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[460px] [&>*]:min-w-0"
      >
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-lg font-semibold tracking-tight">{title}</DialogTitle>
          {description && <DialogDescription className="text-sm leading-relaxed">{description}</DialogDescription>}
        </DialogHeader>
        <div className={cn("min-w-0 px-6 pt-4", !footer && "pb-6", className)}>{children}</div>
        {footer && <div className="flex justify-end gap-2 px-6 pt-5 pb-6">{footer}</div>}
      </DialogContent>
    </Dialog>
  )
}
