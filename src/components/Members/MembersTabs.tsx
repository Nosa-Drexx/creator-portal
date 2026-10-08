"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { SPRING_SNAPPY } from "@/components/shared/motion/easing"
import { routes } from "@/constants/routes"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { cn } from "@/lib/utils"

export function MembersTabs() {
  const slug = useWorkspaceSlug()
  const pathname = usePathname()
  const tabs = [
    { href: routes.members(slug), label: "Members", active: pathname === routes.members(slug) },
    { href: routes.roles(slug), label: "Roles", active: pathname.startsWith(routes.roles(slug)) },
  ]

  return (
    <nav aria-label="Team sections" className="inline-flex w-fit items-center gap-0.5 rounded-[11px] bg-muted p-[3px]">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.active ? "page" : undefined}
          className={cn(
            "relative flex h-8 items-center rounded-lg px-3.5 text-[13px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            tab.active ? "text-text-primary" : "text-text-tertiary hover:text-text-secondary",
          )}
        >
          {tab.active && (
            <motion.span
              layoutId="members-tab"
              transition={SPRING_SNAPPY}
              className="absolute inset-0 rounded-lg bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.06),0_0_0_1px_var(--stroke)]"
            />
          )}
          <span className="relative">{tab.label}</span>
        </Link>
      ))}
    </nav>
  )
}
