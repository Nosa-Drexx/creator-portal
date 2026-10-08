"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, CheckmarkBadge01Icon, Mail01Icon, Tick02Icon, UnfoldMoreIcon } from "@hugeicons/core-free-icons"
import { InvitationsDialog } from "@/components/Invitations/InvitationsDialog"
import { useMyInvitations } from "@/hooks/queries/use-members"
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
import { landingPathFor, NAV_ITEMS, navItemsForPermissions } from "./nav-items"
import { EVerificationStatus } from "@/enums/verification"
import { useSession } from "@/hooks/queries/use-session"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { cn } from "@/lib/utils"
import type { Workspace } from "@/types/workspace"
import { CreateWorkspaceModal } from "./CreateWorkspaceModal"

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
  const [creating, setCreating] = useState(false)
  const [viewingInvites, setViewingInvites] = useState(false)
  const { data: invitations = [] } = useMyInvitations()

  // Stay on the same section if the role there allows it, otherwise land somewhere allowed
  const targetPath = (ws: Workspace) => {
    const next = switchWorkspacePath(pathname, ws.slug)
    const section = NAV_ITEMS.find((item) => next === item.href(ws.slug) || next.startsWith(`${item.href(ws.slug)}/`))
    const allowed = navItemsForPermissions(ws.permissions)
    return section && !allowed.includes(section) ? landingPathFor(ws.slug, ws.permissions) : next
  }

  if (isPending) {
    return (
      <div className={cn("flex items-center gap-2.5 p-1.5", className)}>
        <Skeleton className="size-8 rounded-[9px]" />
        {!compact && <Skeleton className="h-4 w-28 collapsed:hidden" />}
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
        <span className="relative">
          <WorkspaceAvatar name={current?.name ?? "?"} color={current?.accentColor ?? "var(--ink-400)"} />
          {invitations.length > 0 && (
            <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-brand ring-2 ring-canvas" aria-label="Pending invitations" />
          )}
        </span>
        {!compact && (
          <>
            <span className="flex min-w-0 flex-1 flex-col collapsed:hidden">
              <span className="flex items-center gap-1 truncate text-sm font-semibold text-text-primary">
                {current?.name ?? "Unknown workspace"}
                {current?.verificationStatus === EVerificationStatus.Verified && (
                  <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} className="shrink-0 text-info" />
                )}
              </span>
              <span className="truncate text-xs text-text-tertiary">{current?.handle}</span>
            </span>
            <HugeiconsIcon icon={UnfoldMoreIcon} size={16} className="shrink-0 text-text-tertiary collapsed:hidden" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={6} className="w-64 rounded-xl p-1.5">
        <DropdownMenuLabel className="px-2 text-xs font-medium text-text-tertiary">Your workspaces</DropdownMenuLabel>
        {session?.workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onSelect={() => ws.slug !== slug && router.push(targetPath(ws))}
            className="gap-2.5 rounded-lg p-2"
          >
            <WorkspaceAvatar name={ws.name} color={ws.accentColor} className="size-7 rounded-lg text-[11px]" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">{ws.name}</span>
              <span className="truncate text-xs text-text-tertiary">
                {ws.verificationStatus === EVerificationStatus.Verified ? "Verified" : "Not verified"} · {ws.role.name}
              </span>
            </span>
            {ws.slug === slug && <HugeiconsIcon icon={Tick02Icon} size={16} className="text-brand" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {invitations.length > 0 && (
          <DropdownMenuItem onSelect={() => setViewingInvites(true)} className="gap-2.5 rounded-lg p-2">
            <span className="grid size-7 place-items-center rounded-lg bg-brand-soft text-brand">
              <HugeiconsIcon icon={Mail01Icon} size={14} />
            </span>
            <span className="flex-1 text-sm font-medium">Invitations</span>
            <span className="rounded-full bg-brand px-1.5 text-[11px] font-bold text-brand-foreground tabular">{invitations.length}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => setCreating(true)} className="gap-2.5 rounded-lg p-2">
          <span className="grid size-7 place-items-center rounded-lg border border-dashed border-stroke-strong text-text-secondary">
            <HugeiconsIcon icon={Add01Icon} size={14} />
          </span>
          <span className="text-sm font-medium">New workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
      <CreateWorkspaceModal open={creating} onOpenChange={setCreating} />
      <InvitationsDialog open={viewingInvites} onOpenChange={setViewingInvites} />
    </DropdownMenu>
  )
}
