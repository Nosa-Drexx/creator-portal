"use client"

import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

interface CustomDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
  containerClassName?: string
  /** Blocks closing while a request is in flight */
  isPerformingAction?: boolean
  direction?: "left" | "right" | "bottom"
}

export function CustomDrawer({
  open,
  onOpenChange,
  children,
  className,
  containerClassName,
  isPerformingAction = false,
  direction = "right",
}: CustomDrawerProps) {
  const handleOpenChange = (value: boolean) => {
    if (isPerformingAction) return
    onOpenChange(value)
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} direction={direction}>
      <DrawerContent
        className={cn(
          direction === "bottom" ? "max-h-[92dvh]" : "w-screen! max-w-[400px]!",
          "border-stroke bg-surface",
          className,
        )}
      >
        <div className={cn("flex w-full flex-1 flex-col overflow-y-auto", containerClassName)}>{children}</div>
      </DrawerContent>
    </Drawer>
  )
}
