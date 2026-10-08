import type { Metadata } from "next"
import { ClientBoundary } from "@/components/shared/ClientBoundary"
import { OverviewPage } from "@/components/Overview/OverviewPage"
import { OverviewSkeleton } from "@/components/Overview/OverviewSkeleton"

export const metadata: Metadata = { title: "Overview" }

export default function Page() {
  return (
    <ClientBoundary fallback={<OverviewSkeleton />}>
      <OverviewPage />
    </ClientBoundary>
  )
}
