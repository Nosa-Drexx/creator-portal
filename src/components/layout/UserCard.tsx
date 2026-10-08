"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/hooks/queries/use-session"
import { initials } from "@/lib/format"
import { ThemeToggle } from "./ThemeToggle"

export function UserCard() {
  const { data: session } = useSession()

  return (
    <div className="flex items-center gap-2.5 collapsed:flex-col">
      {session ? (
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink-900 text-[11px] font-bold text-ink-0 dark:bg-ink-100 dark:text-ink-900">
          {initials(session.user.name)}
        </span>
      ) : (
        <Skeleton className="size-8 rounded-full" />
      )}
      <div className="flex min-w-0 flex-1 flex-col collapsed:hidden">
        <span className="truncate text-[13px] font-semibold text-text-primary">{session?.user.name ?? " "}</span>
        <span className="truncate text-xs text-text-tertiary">{session?.user.email ?? " "}</span>
      </div>
      <ThemeToggle />
    </div>
  )
}
