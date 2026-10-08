import type { Metadata } from "next"
import { ClientBoundary } from "@/components/shared/ClientBoundary"
import { RequirePermission } from "@/components/shared/Permissions"
import { EModule } from "@/constants/permissions"
import { ContentListPage } from "@/components/Content/ContentList/ContentListPage"
import { ContentListSkeleton } from "@/components/Content/ContentListSkeleton"

export const metadata: Metadata = { title: "Content" }

export default function Page() {
  return (
    <ClientBoundary fallback={<ContentListSkeleton />}>
      <RequirePermission module={EModule.Content} fallback={<ContentListSkeleton />}>
        <ContentListPage />
      </RequirePermission>
    </ClientBoundary>
  )
}
