"use client"

import { useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { SidebarLeftIcon } from "@hugeicons/core-free-icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebarState } from "@/hooks/use-sidebar-state"
import { CreateButton } from "./CreateButton"
import { SidebarNav } from "./SidebarNav"
import { UserCard } from "./UserCard"
import { VerifyCallout } from "./VerifyCallout"
import { WorkspaceSwitcher } from "./WorkspaceSwitcher"

/** Collapsible on tablet and desktop (⌘B), hidden on mobile where the tab bar takes over */
export function Sidebar() {
  const { collapsed, toggle } = useSidebarState()

  useEffect(() => {
    document.documentElement.dataset.sidebar = collapsed ? "collapsed" : "expanded"
  }, [collapsed])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [toggle])

  return (
    <aside
      data-collapsed={collapsed}
      className="group/sidebar sticky top-0 hidden h-dvh w-[252px] shrink-0 flex-col gap-5 border-r border-stroke bg-canvas px-4 py-4 transition-[width,padding] duration-300 ease-out-soft md:flex collapsed:w-[72px] collapsed:px-3">
      <WorkspaceSwitcher className="collapsed:justify-center" />
      <CreateButton />
      <SidebarNav />
      <div className="mt-auto flex flex-col gap-4">
        <VerifyCallout />
        <UserCard />
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="absolute top-[22px] -right-3 z-10 grid size-6 place-items-center rounded-full border border-stroke bg-surface text-text-tertiary opacity-0 shadow-card transition-[opacity,color,transform] duration-200 group-hover/sidebar:opacity-100 hover:text-text-primary focus-visible:opacity-100 active:scale-90 collapsed:opacity-100"
          >
            <HugeiconsIcon
              icon={SidebarLeftIcon}
              size={13}
              className="transition-transform duration-300 collapsed:rotate-180"
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {collapsed ? "Expand" : "Collapse"} <kbd className="ml-1 opacity-60">⌘B</kbd>
        </TooltipContent>
      </Tooltip>
    </aside>
  )
}
