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
import { landingPathFor } from "@/components/layout/nav-items"
import { SESSION_QUERY_KEY, useOptionalSession } from "@/hooks/queries/use-session"
import { useLogOut } from "@/hooks/mutations/use-auth-mutations"
import { customToast } from "@/hooks/use-toast"
import { getApiErrorMessage } from "@/lib/axios"
import { acceptInvitationByToken, fetchInvitationPreview } from "@/services/api/members"
import type { InvitationPreview } from "@/types/members"

export function InviteLinkPage() {
  const { token } = useParams<{ token: string }>()
  const session = useOptionalSession()
  const invite = useQuery({ queryKey: ["invite-link", token], queryFn: () => fetchInvitationPreview(token), retry: false })

  return (
    <div className="flex min-h-dvh flex-col px-4 py-6 sm:px-8">
      <Logo />
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10">
        {invite.isPending || session.isPending ? (
          <Skeleton className="h-64 rounded-2xl" />
        ) : invite.isError ? (
          <div className="flex animate-rise flex-col items-center gap-3 rounded-2xl bg-surface p-8 text-center shadow-card">
            <HugeiconsIcon icon={MailOpen01Icon} size={26} className="text-text-tertiary" />
            <h1 className="text-lg font-bold">This invitation isn&apos;t valid</h1>
            <p className="text-sm text-text-secondary">It may have expired, been revoked or already been used. Ask for a new link.</p>
            <Button asChild variant="outline" className="mt-2">
              <Link href="/">Go to CreatorHub</Link>
            </Button>
          </div>
        ) : (
          <div className="flex animate-rise flex-col items-center gap-5 rounded-2xl bg-surface p-6 text-center shadow-card sm:p-8">
            <WorkspaceAvatar name={invite.data.workspace.name} color={invite.data.workspace.accentColor} className="size-14 rounded-2xl text-lg" />
            <div className="flex min-w-0 flex-col gap-1.5">
              <h1 className="text-xl font-bold">Join {invite.data.workspace.name}</h1>
              <p className="text-sm text-text-secondary">
                {invite.data.invitedBy} invited you to join as <span className="font-semibold text-text-primary">{invite.data.role.name}</span>.
              </p>
            </div>
            <InviteActions token={token} invite={invite.data} signedInAs={session.data?.user.email ?? null} />
          </div>
        )}
      </div>
    </div>
  )
}

interface InviteActionsProps {
  token: string
  invite: InvitationPreview
  signedInAs: string | null
}

/** Signed out: log in or sign up with the invited email, then land back here to accept */
function InviteActions({ token, invite, signedInAs }: InviteActionsProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const logout = useLogOut(`/invite/${token}`)
  const accept = useMutation({
    mutationFn: () => acceptInvitationByToken(token),
    onSuccess: ({ slug, permissions }) => {
      queryClient.invalidateQueries({ queryKey: [...SESSION_QUERY_KEY] })
      customToast("success", "You've joined the workspace")
      router.replace(landingPathFor(slug, permissions))
    },
    onError: (error) => customToast("error", getApiErrorMessage(error, "We couldn't accept this invitation.")),
  })

  if (!signedInAs) {
    const params = new URLSearchParams({ next: `/invite/${token}`, email: invite.email }).toString()
    const primary = invite.hasAccount
      ? { href: `/login?${params}`, label: "Log in to accept" }
      : { href: `/signup?${params}`, label: "Create your account" }
    const secondary = invite.hasAccount
      ? { href: `/signup?${params}`, prompt: "New here?", label: "Create an account" }
      : { href: `/login?${params}`, prompt: "Already have an account?", label: "Log in" }
    return (
      <div className="flex w-full flex-col gap-3">
        <p className="text-[13px] text-text-tertiary">
          Sent to <span className="break-all font-medium text-text-secondary">{invite.email}</span>
        </p>
        <Button asChild size="xl" className="w-full">
          <Link href={primary.href}>{primary.label}</Link>
        </Button>
        <p className="text-[13px] text-text-secondary">
          {secondary.prompt}{" "}
          <Link href={secondary.href} className="font-semibold text-text-primary underline-offset-4 hover:underline">
            {secondary.label}
          </Link>
        </p>
      </div>
    )
  }

  if (signedInAs.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <div className="flex w-full flex-col gap-3 rounded-xl bg-warning-surface p-3.5 text-left text-[13px] text-text-secondary">
        <p className="break-words">
          This invitation is for <strong className="break-all text-text-primary">{invite.email}</strong>, but you&apos;re signed in as{" "}
          <strong className="break-all text-text-primary">{signedInAs}</strong>.
        </p>
        <Button variant="outline" size="sm" onClick={() =>
            logout.mutate(undefined, { onSuccess: () => queryClient.setQueryData([...SESSION_QUERY_KEY, "optional"], null) })
          } isLoading={logout.isPending}>
          Log out and switch account
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <Button size="xl" className="w-full" onClick={() => accept.mutate()} isLoading={accept.isPending}>
        Accept invitation
      </Button>
      <Button asChild variant="ghost" className="w-full">
        <Link href="/">Not now</Link>
      </Button>
    </div>
  )
}
