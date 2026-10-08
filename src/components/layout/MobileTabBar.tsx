"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { SPRING_SNAPPY } from "@/components/shared/motion/easing"
import { routes } from "@/constants/routes"
import { EVerificationStatus } from "@/enums/verification"
import { useWorkspace } from "@/hooks/queries/use-workspace"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { cn } from "@/lib/utils"
import { isNavActive, NAV_ITEMS, type NavItem } from "./nav-items"

const TABS = NAV_ITEMS.filter((item) => item.id !== "settings")

function Tab({ item, slug, pathname, dot }: { item: NavItem; slug: string; pathname: string; dot?: boolean }) {
  const active = isNavActive(item, slug, pathname)
  return (
    <Link
      href={item.href(slug)}
      aria-current={active ? "page" : undefined}
      className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10.5px] font-semibold"
    >
      <span className="relative grid h-7 w-12 place-items-center">
        {active && (
          <motion.span layoutId="tab-active" transition={SPRING_SNAPPY} className="absolute inset-0 rounded-full bg-brand-soft" />
        )}
        <HugeiconsIcon
          icon={item.icon}
          size={20}
          className={cn("relative transition-colors", active ? "text-brand" : "text-text-tertiary")}
        />
        {dot && <span className="absolute top-0.5 right-2.5 size-1.5 rounded-full bg-warning ring-2 ring-surface" />}
      </span>
      <span className={cn("transition-colors", active ? "text-text-primary" : "text-text-tertiary")}>
        {item.id === "verification" ? "Verify" : item.label}
      </span>
    </Link>
  )
}

/** Thumb-reach navigation for phones with a centred primary action */
export function MobileTabBar() {
  const slug = useWorkspaceSlug()
  const pathname = usePathname()
  const { data: workspace } = useWorkspace()
  const needsVerification = !!workspace && workspace.verificationStatus !== EVerificationStatus.Verified
  const [first, second, third, fourth] = TABS
  // Editors get a focused screen with their own sticky action bar
  if (/\/content\/(new|[^/]+\/edit)$/.test(pathname)) return null

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-stroke/70 bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150 md:hidden"
    >
      <div className="mx-auto flex h-16 max-w-md items-stretch px-2">
        <Tab item={first} slug={slug} pathname={pathname} />
        <Tab item={second} slug={slug} pathname={pathname} />
        <div className="flex flex-1 items-center justify-center">
          <Link
            href={routes.newContent(slug)}
            aria-label="Upload video"
            className="grid size-12 -translate-y-3 place-items-center rounded-2xl bg-brand text-brand-foreground shadow-[0_10px_24px_-8px_var(--brand)] ring-4 ring-canvas transition-transform duration-200 ease-out-soft active:scale-95"
          >
            <HugeiconsIcon icon={Add01Icon} size={22} strokeWidth={2.4} />
          </Link>
        </div>
        <Tab item={third} slug={slug} pathname={pathname} />
        <Tab item={fourth} slug={slug} pathname={pathname} dot={needsVerification} />
      </div>
    </nav>
  )
}
