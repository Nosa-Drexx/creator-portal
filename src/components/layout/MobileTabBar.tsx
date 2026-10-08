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
import { EAction, EModule } from "@/constants/permissions"
import { usePermissions } from "@/hooks/use-permissions"
import { isNavActive, navItemsForPermissions, type NavItem } from "./nav-items"

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
        {item.shortLabel ?? item.label}
      </span>
    </Link>
  )
}

const TAB_PRIORITY: NavItem["id"][] = ["overview", "content", "purchases", "verification", "members"]

/** Thumb-reach navigation with a centred upload action; tabs follow the member's permissions */
export function MobileTabBar() {
  const slug = useWorkspaceSlug()
  const pathname = usePathname()
  const { data: workspace } = useWorkspace()
  const { permissions, can, loading } = usePermissions()
  // Editors get a focused screen with their own sticky action bar
  if (loading || /\/content\/(new|[^/]+\/edit)$/.test(pathname)) return null

  const allowed = navItemsForPermissions(permissions)
  const tabs = TAB_PRIORITY.map((id) => allowed.find((item) => item.id === id)).filter(Boolean).slice(0, 4) as NavItem[]
  const canUpload = can(EAction.Create, EModule.Content)
  const needsVerification = !!workspace && workspace.verificationStatus !== EVerificationStatus.Verified
  const renderTab = (item: NavItem) => (
    <Tab
      key={item.id}
      item={item}
      slug={slug}
      pathname={pathname}
      dot={item.id === "verification" && needsVerification}
    />
  )

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-stroke/70 bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150 md:hidden"
    >
      <div className="mx-auto flex h-16 max-w-md items-stretch px-2">
        {tabs.slice(0, 2).map(renderTab)}
        {canUpload && (
          <div className="flex flex-1 items-center justify-center">
            <Link
              href={routes.newContent(slug)}
              aria-label="Upload video"
              className="grid size-12 -translate-y-3 place-items-center rounded-2xl bg-brand text-brand-foreground shadow-[0_10px_24px_-8px_var(--brand)] ring-4 ring-canvas transition-transform duration-200 ease-out-soft active:scale-95"
            >
              <HugeiconsIcon icon={Add01Icon} size={22} strokeWidth={2.4} />
            </Link>
          </div>
        )}
        {tabs.slice(2).map(renderTab)}
      </div>
    </nav>
  )
}
