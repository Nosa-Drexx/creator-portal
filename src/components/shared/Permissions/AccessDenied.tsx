"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { SquareLock02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { landingPathFor } from "@/components/layout/nav-items"
import { usePermissions } from "@/hooks/use-permissions"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"

interface AccessDeniedProps {
  title?: string
  message?: string
}

export function AccessDenied({
  title = "You don't have access to this page",
  message = "Your role in this workspace doesn't include it. Ask a workspace admin if you need access.",
}: AccessDeniedProps) {
  const { role, permissions } = usePermissions()
  const slug = useWorkspaceSlug()

  return (
    <div role="alert" className="flex flex-1 animate-rise flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <span className="grid size-12 place-items-center rounded-2xl border border-stroke bg-surface text-text-secondary shadow-card">
        <HugeiconsIcon icon={SquareLock02Icon} size={22} />
      </span>
      <div className="flex max-w-sm flex-col gap-1.5">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm text-text-secondary">{message}</p>
        {role && <p className="text-xs text-text-tertiary">Your role: {role.name}</p>}
      </div>
      <Button asChild variant="outline">
        <Link href={landingPathFor(slug, permissions)}>Go to an allowed page</Link>
      </Button>
    </div>
  )
}
