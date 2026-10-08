"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { MailOpen01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Logo } from "@/components/shared/Logo"
import { WorkspaceAvatar } from "@/components/shared/WorkspaceAvatar"
import { routes } from "@/constants/routes"
import { SESSION_QUERY_KEY, useSession } from "@/hooks/queries/use-session"
import { useLogOut } from "@/hooks/mutations/use-auth-mutations"
import { customToast } from "@/hooks/use-toast"
import { getApiErrorMessage } from "@/lib/axios"
import { acceptInvitationByToken, fetchInvitationByToken } from "@/services/api/members"

export function InviteLinkPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const logout = useLogOut()
  const invite = useQuery({ queryKey: ["invite-link", token], queryFn: () => fetchInvitationByToken(token), retry: false })
  const accept = useMutation({
    mutationFn: () => acceptInvitationByToken(token),
    onSuccess: ({ slug }) => {
      queryClient.invalidateQueries({ queryKey: [...SESSION_QUERY_KEY] })
      customToast("success", "You've joined the workspace")
      router.replace(routes.overview(slug))
    },
    onError: (error) => customToast("error", getApiErrorMessage(error, "We couldn't accept this invitation.")),
  })

  return (
    <div className="flex min-h-dvh flex-col px-4 py-6 sm:px-8">
      <Logo />
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10">
        {invite.isPending ? (
          <Skeleton className="h-64 rounded-2xl" />
        ) : invite.isError ? (
          <div className="flex animate-rise flex-col items-center gap-3 rounded-2xl bg-surface p-8 text-center shadow-card">
            <HugeiconsIcon icon={MailOpen01Icon} size={26} className="text-text-tertiary" />
            <h1 className="text-lg font-bold">This invitation isn&apos;t valid</h1>
            <p className="text-sm text-text-secondary">It may have expired, been revoked or already been used. Ask for a new link.</p>
            <Button asChild variant="outline" className="mt-2">
              <Link href="/">Go to my workspaces</Link>
            </Button>
          </div>
        ) : (
          <div className="flex animate-rise flex-col items-center gap-5 rounded-2xl bg-surface p-6 text-center shadow-card sm:p-8">
            <WorkspaceAvatar name={invite.data.workspace.name} color={invite.data.workspace.accentColor} className="size-14 rounded-2xl text-lg" />
            <div className="flex flex-col gap-1.5">
              <h1 className="text-xl font-bold">Join {invite.data.workspace.name}</h1>
              <p className="text-sm text-text-secondary">
                {invite.data.invitedBy} invited you to join as <span className="font-semibold text-text-primary">{invite.data.role.name}</span>.
              </p>
            </div>
            {invite.data.forYou ? (
              <div className="flex w-full flex-col gap-2">
                <Button size="xl" className="w-full" onClick={() => accept.mutate()} isLoading={accept.isPending}>
                  Accept invitation
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/">Not now</Link>
                </Button>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-3 rounded-xl bg-warning-surface p-3.5 text-left text-[13px] text-text-secondary">
                <p>
                  This invitation is for <strong className="text-text-primary">{invite.data.email}</strong>, but you&apos;re signed in as{" "}
                  <strong className="text-text-primary">{session?.user.email}</strong>.
                </p>
                <Button variant="outline" size="sm" onClick={() => logout.mutate()} isLoading={logout.isPending}>
                  Log out and switch account
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
