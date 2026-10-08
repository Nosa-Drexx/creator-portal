"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Settings02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { routes } from "@/constants/routes"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { ThemeToggle } from "./ThemeToggle"
import { WorkspaceSwitcher } from "./WorkspaceSwitcher"

export function MobileTopBar() {
  const slug = useWorkspaceSlug()
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-stroke/70 bg-canvas/85 px-3 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150 md:hidden">
      <div className="flex h-14 min-w-0 flex-1 items-center">
        <WorkspaceSwitcher className="max-w-[260px]" />
      </div>
      <ThemeToggle />
      <Button asChild variant="ghost" size="icon-sm" aria-label="Demo & settings">
        <Link href={routes.settings(slug)}>
          <HugeiconsIcon icon={Settings02Icon} size={18} />
        </Link>
      </Button>
    </header>
  )
}
