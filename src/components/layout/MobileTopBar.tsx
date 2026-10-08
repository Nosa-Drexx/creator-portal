"use client"

import { ThemeToggle } from "./ThemeToggle"
import { UserMenu } from "./UserMenu"
import { WorkspaceSwitcher } from "./WorkspaceSwitcher"

export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-stroke/70 bg-canvas/85 px-3 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150 md:hidden">
      <div className="flex h-14 min-w-0 flex-1 items-center">
        <WorkspaceSwitcher className="max-w-[260px]" />
      </div>
      <ThemeToggle />
      <UserMenu align="end" />
    </header>
  )
}
