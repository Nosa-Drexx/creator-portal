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
import { isNavActive, NAV_ITEMS } from "./nav-items"

export function SidebarNav() {
  const slug = useWorkspaceSlug()
  const pathname = usePathname()
  const { data: workspace } = useWorkspace()
  const needsVerification = workspace && workspace.verificationStatus !== EVerificationStatus.Verified

  return (
    <nav aria-label="Main" className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const active = isNavActive(item, slug, pathname)
        return (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <Link
                href={item.href(slug)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-9 items-center gap-2.5 rounded-[10px] px-2.5 text-sm font-medium transition-colors max-lg:justify-center",
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
                <span className="relative hidden flex-1 lg:inline">{item.label}</span>
                {item.id === "verification" && needsVerification && (
                  <span className="relative size-1.5 rounded-full bg-warning max-lg:absolute max-lg:top-2 max-lg:right-2" />
                )}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="lg:hidden">
              {item.label}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </nav>
  )
}
