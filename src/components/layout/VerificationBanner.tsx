"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, SquareLock02Icon } from "@hugeicons/core-free-icons"
import { routes } from "@/constants/routes"
import { EVerificationStatus } from "@/enums/verification"
import { useWorkspace } from "@/hooks/queries/use-workspace"
import { EAction, EModule } from "@/constants/permissions"
import { usePermissions } from "@/hooks/use-permissions"

/** Below desktop the sidebar callout is hidden, so surface the lock here instead */
export function VerificationBanner() {
  const { data: workspace } = useWorkspace()
  const { can } = usePermissions()
  const pathname = usePathname()
  if (!workspace || workspace.verificationStatus === EVerificationStatus.Verified) return null
  if (!can(EAction.View, EModule.Verification)) return null
  if (pathname.startsWith(routes.verification(workspace.slug))) return null
  const pending = workspace.verificationStatus === EVerificationStatus.Pending

  return (
    <Link
      href={routes.verification(workspace.slug)}
      className="group flex animate-rise items-center gap-3 rounded-xl border border-warning-stroke bg-warning-surface px-3.5 py-2.5 text-[13px] md:[html:not([data-sidebar=collapsed])_&]:hidden"
    >
      <HugeiconsIcon icon={SquareLock02Icon} size={16} className="shrink-0 text-warning" />
      <span className="flex-1 font-medium text-text-primary">
        {pending ? "Verification under review. Publishing unlocks once approved." : "Verify your identity to unlock publishing."}
      </span>
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        size={16}
        className="shrink-0 text-warning transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </Link>
  )
}
