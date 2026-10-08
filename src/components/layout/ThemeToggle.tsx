"use client"

import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative overflow-hidden"
    >
      <HugeiconsIcon
        icon={Sun03Icon}
        size={17}
        className="absolute transition-[opacity,rotate] duration-300 ease-out-soft dark:rotate-90 dark:opacity-0"
      />
      <HugeiconsIcon
        icon={Moon02Icon}
        size={17}
        className="absolute opacity-0 transition-[opacity,rotate] duration-300 ease-out-soft -rotate-90 dark:rotate-0 dark:opacity-100"
      />
    </Button>
  )
}
