"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

/** A real switch: the thumb slides and swaps sun for moon */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [pending, setPending] = useState<boolean | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const isDark = pending ?? resolvedTheme === "dark"

  useEffect(() => () => clearTimeout(timer.current), [])

  // Theme changes disable transitions globally, so let the thumb finish sliding first
  const onChange = (checked: boolean) => {
    setPending(checked)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setTheme(checked ? "dark" : "light")
      setPending(null)
    }, 220)
  }

  return (
    <Switch
      size="lg"
      checked={isDark}
      onCheckedChange={onChange}
      aria-label="Dark mode"
      className={cn("data-checked:bg-ink-700 data-unchecked:bg-ink-200 dark:data-unchecked:bg-ink-800", className)}
      thumb={
        <span className="relative grid size-full place-items-center text-text-secondary">
          <HugeiconsIcon
            icon={Sun03Icon}
            size={12}
            strokeWidth={2.2}
            className="absolute transition-[opacity,rotate] duration-300 ease-out-soft in-data-checked:-rotate-90 in-data-checked:opacity-0"
          />
          <HugeiconsIcon
            icon={Moon02Icon}
            size={12}
            strokeWidth={2.2}
            className="absolute rotate-90 opacity-0 transition-[opacity,rotate] duration-300 ease-out-soft in-data-checked:rotate-0 in-data-checked:opacity-100"
          />
        </span>
      }
    />
  )
}
