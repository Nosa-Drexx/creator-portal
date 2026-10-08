"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SPRING_SNAPPY } from "@/components/shared/motion/easing"
import { EVerificationStatus } from "@/enums/verification"
import { useWorkspace } from "@/hooks/queries/use-workspace"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/hooks/use-permissions"
import { Skeleton } from "@/components/ui/skeleton"
import { isNavActive, navItemsForPermissions } from "./nav-items"

export function SidebarNav() {
  const slug = useWorkspaceSlug()
  const pathname = usePathname()
  const { data: workspace } = useWorkspace()
  const { permissions, loading } = usePermissions()
  const needsVerification = workspace && workspace.verificationStatus !== EVerificationStatus.Verified

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 rounded-[10px]" />
        ))}
      </div>
    )
  }

  return (
    <nav aria-label="Main" className="flex flex-col gap-0.5">
      {navItemsForPermissions(permissions).map((item) => {
        const active = isNavActive(item, slug, pathname)
        return (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <Link
                href={item.href(slug)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-9 items-center gap-2.5 rounded-[10px] px-2.5 text-sm font-medium transition-colors collapsed:justify-center",
                  active ? "text-text-primary" : "text-text-secondary hover:bg-muted/70 hover:text-text-primary",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    transition={SPRING_SNAPPY}
                    className="absolute inset-0 rounded-[10px] bg-surface shadow-card"
                  />
                )}
                <HugeiconsIcon
                  icon={item.icon}
                  size={18}
                  className={cn("relative shrink-0", active && "text-brand")}
                />
                <span className="relative flex-1 truncate collapsed:hidden">{item.label}</span>
                {item.id === "verification" && needsVerification && (
                  <span className="relative size-1.5 rounded-full bg-warning collapsed:absolute collapsed:top-2 collapsed:right-2" />
                )}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="hidden collapsed:block">
              {item.label}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </nav>
  )
}
