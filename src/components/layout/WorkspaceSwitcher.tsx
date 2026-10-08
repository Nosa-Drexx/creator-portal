"use client"

import { usePathname, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkBadge01Icon, Tick02Icon, UnfoldMoreIcon } from "@hugeicons/core-free-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { WorkspaceAvatar } from "@/components/shared/WorkspaceAvatar"
import { switchWorkspacePath } from "@/constants/routes"
import { EVerificationStatus } from "@/enums/verification"
import { useSession } from "@/hooks/queries/use-session"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { cn } from "@/lib/utils"

interface WorkspaceSwitcherProps {
  compact?: boolean
  className?: string
}

export function WorkspaceSwitcher({ compact, className }: WorkspaceSwitcherProps) {
  const { data: session, isPending } = useSession()
  const slug = useWorkspaceSlug()
  const router = useRouter()
  const pathname = usePathname()
  const current = session?.workspaces.find((w) => w.slug === slug)

  if (isPending) {
    return (
      <div className={cn("flex items-center gap-2.5 p-1.5", className)}>
        <Skeleton className="size-8 rounded-[9px]" />
        {!compact && <Skeleton className="h-4 w-28" />}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group flex w-full items-center gap-2.5 rounded-xl p-1.5 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40 data-[state=open]:bg-muted",
          className,
        )}
      >
        <WorkspaceAvatar name={current?.name ?? "?"} color={current?.accentColor ?? "var(--ink-400)"} />
        {!compact && (
          <>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex items-center gap-1 truncate text-sm font-semibold text-text-primary">
                {current?.name ?? "Unknown workspace"}
                {current?.verificationStatus === EVerificationStatus.Verified && (
                  <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} className="shrink-0 text-info" />
                )}
              </span>
              <span className="truncate text-xs text-text-tertiary">{current?.handle}</span>
            </span>
            <HugeiconsIcon icon={UnfoldMoreIcon} size={16} className="shrink-0 text-text-tertiary" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={6} className="w-64 rounded-xl p-1.5">
        <DropdownMenuLabel className="px-2 text-xs font-medium text-text-tertiary">Your workspaces</DropdownMenuLabel>
        {session?.workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onSelect={() => ws.slug !== slug && router.push(switchWorkspacePath(pathname, ws.slug))}
            className="gap-2.5 rounded-lg p-2"
          >
            <WorkspaceAvatar name={ws.name} color={ws.accentColor} className="size-7 rounded-lg text-[11px]" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">{ws.name}</span>
              <span className="truncate text-xs text-text-tertiary">
                {ws.verificationStatus === EVerificationStatus.Verified ? "Verified" : "Not verified"} · {ws.role}
              </span>
            </span>
            {ws.slug === slug && <HugeiconsIcon icon={Tick02Icon} size={16} className="text-brand" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <p className="px-2 py-1.5 text-[11px] leading-snug text-text-tertiary">
          Each workspace has its own content, revenue and verification.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
