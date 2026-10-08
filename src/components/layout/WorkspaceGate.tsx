"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { SquareLock02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/shared/ErrorState"
import { DEFAULT_WORKSPACE_SLUG } from "@/constants/demo"
import { routes } from "@/constants/routes"
import { EErrorCode } from "@/enums/errors"
import { useWorkspace } from "@/hooks/queries/use-workspace"
import { isApiErrorCode } from "@/lib/axios"

/** Covers the app when the tenant can't be resolved (unknown slug, not a member, or API down) */
export function WorkspaceGate() {
  const { data, error, isPending, refetch, isRefetching } = useWorkspace()

  if (isPending || data) return null

  if (isApiErrorCode(error, EErrorCode.NotFound)) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-canvas px-6">
        <div className="flex max-w-sm animate-rise flex-col items-center gap-4 text-center">
          <span className="grid size-12 place-items-center rounded-2xl border border-stroke bg-surface shadow-card">
            <HugeiconsIcon icon={SquareLock02Icon} size={22} />
          </span>
          <h1 className="text-xl font-bold">Workspace not found</h1>
          <p className="text-sm text-text-secondary">
            This workspace doesn&apos;t exist, or you&apos;re not a member of it. Ask an owner to invite you.
          </p>
          <Button asChild>
            <Link href={routes.overview(DEFAULT_WORKSPACE_SLUG)}>Go to my workspace</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-canvas">
      <ErrorState error={error} title="We couldn't open this workspace" onRetry={refetch} isRetrying={isRefetching} />
    </div>
  )
}
