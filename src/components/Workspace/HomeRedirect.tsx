"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { ErrorState } from "@/components/shared/ErrorState"
import { routes } from "@/constants/routes"
import { useSession } from "@/hooks/queries/use-session"

/** Signed-in users land in their first workspace, or onboarding if they have none */
export function HomeRedirect() {
  const router = useRouter()
  const { data, error, refetch, isRefetching } = useSession()

  useEffect(() => {
    if (!data) return
    const first = data.workspaces[0]
    router.replace(first ? routes.overview(first.slug) : "/onboarding")
  }, [data, router])

  return (
    <div className="grid min-h-dvh place-items-center">
      {error ? <ErrorState error={error} onRetry={refetch} isRetrying={isRefetching} /> : <Spinner className="size-5 text-text-tertiary" />}
    </div>
  )
}
