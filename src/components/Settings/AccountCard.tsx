"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { SectionCard } from "@/components/shared/SectionCard"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { routes } from "@/constants/routes"
import { useLogOut } from "@/hooks/mutations/use-auth-mutations"
import { useSession } from "@/hooks/queries/use-session"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"

export function AccountCard() {
  const { data: session } = useSession()
  const slug = useWorkspaceSlug()
  const logout = useLogOut()
  if (!session) return null
  const { user } = session

  return (
    <SectionCard title="Account" bodyClassName="p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className="size-11" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold">{user.name}</span>
            <span className="truncate text-[13px] text-text-tertiary">{user.email}</span>
          </div>
        </div>
        <div className="flex gap-2 max-sm:[&>*]:flex-1">
          <Button asChild variant="outline">
            <Link href={routes.profile(slug)}>Edit profile</Link>
          </Button>
          <Button variant="destructive" onClick={() => logout.mutate()} isLoading={logout.isPending}>
            <HugeiconsIcon icon={Logout01Icon} size={16} />
            Log out
          </Button>
        </div>
      </div>
    </SectionCard>
  )
}
