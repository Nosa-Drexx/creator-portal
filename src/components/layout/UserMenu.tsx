"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon, Settings02Icon, UserGroupIcon, UserIcon } from "@hugeicons/core-free-icons"
import { CanRead } from "@/components/shared/Permissions"
import { EModule } from "@/constants/permissions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { routes } from "@/constants/routes"
import { useLogOut } from "@/hooks/mutations/use-auth-mutations"
import { useSession } from "@/hooks/queries/use-session"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { cn } from "@/lib/utils"

interface UserMenuProps {
  /** Show name and email next to the avatar */
  detailed?: boolean
  align?: "start" | "end"
  className?: string
}

export function UserMenu({ detailed, align = "start", className }: UserMenuProps) {
  const { data: session } = useSession()
  const slug = useWorkspaceSlug()
  const logout = useLogOut()

  if (!session) return <Skeleton className="size-8 rounded-full" />
  const { user } = session

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className={cn(
          "flex min-w-0 items-center gap-2.5 rounded-xl p-1 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40 data-[state=open]:bg-muted",
          className,
        )}
      >
        <UserAvatar name={user.name} avatarUrl={user.avatarUrl} />
        {detailed && (
          <span className="flex min-w-0 flex-1 flex-col collapsed:hidden">
            <span className="truncate text-[13px] font-semibold text-text-primary">{user.name}</span>
            <span className="truncate text-xs text-text-tertiary">{user.email}</span>
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={detailed ? "top" : "bottom"} className="w-56 rounded-xl p-1.5">
        <DropdownMenuLabel className="flex flex-col px-2 py-1.5">
          <span className="truncate text-sm font-semibold">{user.name}</span>
          <span className="truncate text-xs font-normal text-text-tertiary">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {slug && (
          <DropdownMenuItem asChild className="gap-2.5 rounded-lg">
            <Link href={routes.profile(slug)}>
              <HugeiconsIcon icon={UserIcon} size={16} />
              Your profile
            </Link>
          </DropdownMenuItem>
        )}
        {slug && (
          <CanRead module={EModule.Members}>
            <DropdownMenuItem asChild className="gap-2.5 rounded-lg">
              <Link href={routes.members(slug)}>
                <HugeiconsIcon icon={UserGroupIcon} size={16} />
                Team
              </Link>
            </DropdownMenuItem>
          </CanRead>
        )}
        {slug && (
          <DropdownMenuItem asChild className="gap-2.5 rounded-lg">
            <Link href={routes.settings(slug)}>
              <HugeiconsIcon icon={Settings02Icon} size={16} />
              Demo &amp; settings
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          variant="destructive"
          className="gap-2.5 rounded-lg"
          disabled={logout.isPending}
          onSelect={() => logout.mutate()}
        >
          <HugeiconsIcon icon={Logout01Icon} size={16} />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
