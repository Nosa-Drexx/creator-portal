"use client"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/shared/Logo"
import { useSession } from "@/hooks/queries/use-session"
import { useLogOut } from "@/hooks/mutations/use-auth-mutations"
import { useCreateWorkspaceForm } from "./use-create-workspace-form"
import { WorkspaceFormFields } from "./WorkspaceFormFields"

export function OnboardingPage() {
  const { data: session } = useSession()
  const logout = useLogOut()
  const { form, onSubmit, isPending } = useCreateWorkspaceForm()
  const firstName = session?.user.name.split(" ")[0]

  return (
    <div className="flex min-h-dvh flex-col px-4 py-6 sm:px-8">
      <div className="flex items-center justify-between">
        <Logo />
        <Button variant="ghost" size="sm" onClick={() => logout.mutate()} isLoading={logout.isPending}>
          Log out
        </Button>
      </div>
      <div className="mx-auto flex w-full max-w-[440px] flex-1 animate-rise flex-col justify-center gap-7 py-10">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-brand">Getting started</span>
          <h1 className="text-[28px] leading-tight font-bold">
            {firstName ? `Welcome, ${firstName}.` : "Welcome."} Set up your workspace
          </h1>
          <p className="text-sm text-text-secondary">
            Your workspace holds your videos, sales and payout verification. You can create more later, or be invited to
            someone else&apos;s.
          </p>
        </div>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 rounded-2xl bg-surface p-5 shadow-card">
          <WorkspaceFormFields form={form} />
          <Button type="submit" size="xl" isLoading={isPending} className="mt-1 w-full">
            Create workspace
          </Button>
        </form>
      </div>
    </div>
  )
}
