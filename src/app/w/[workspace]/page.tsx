import type { Metadata } from "next"
import { ClientBoundary } from "@/components/shared/ClientBoundary"
import { RequirePermission } from "@/components/shared/Permissions"
import { EModule } from "@/constants/permissions"
import { OverviewPage } from "@/components/Overview/OverviewPage"
import { OverviewSkeleton } from "@/components/Overview/OverviewSkeleton"

export const metadata: Metadata = { title: "Overview" }

export default function Page() {
  return (
    <ClientBoundary fallback={<OverviewSkeleton />}>
      <RequirePermission module={EModule.Analytics} fallback={<OverviewSkeleton />} redirectIfDenied>
        <OverviewPage />
      </RequirePermission>
    </ClientBoundary>
  )
}
