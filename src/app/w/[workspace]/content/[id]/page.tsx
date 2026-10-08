import type { Metadata } from "next"
import { ClientBoundary } from "@/components/shared/ClientBoundary"
import { RequirePermission } from "@/components/shared/Permissions"
import { EModule } from "@/constants/permissions"
import { ContentDetailPage } from "@/components/Content/ContentDetail/ContentDetailPage"
import { ContentDetailSkeleton } from "@/components/Content/ContentDetail/ContentDetailSkeleton"

export const metadata: Metadata = { title: "Video" }

export default function Page() {
  return (
    <ClientBoundary fallback={<ContentDetailSkeleton />}>
      <RequirePermission module={EModule.Content} fallback={<ContentDetailSkeleton />}>
        <ContentDetailPage />
      </RequirePermission>
    </ClientBoundary>
  )
}
