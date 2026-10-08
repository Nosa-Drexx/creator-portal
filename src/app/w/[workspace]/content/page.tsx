import type { Metadata } from "next"
import { ClientBoundary } from "@/components/shared/ClientBoundary"
import { ContentListPage } from "@/components/Content/ContentList/ContentListPage"
import { ContentListSkeleton } from "@/components/Content/ContentListSkeleton"

export const metadata: Metadata = { title: "Content" }

export default function Page() {
  return (
    <ClientBoundary fallback={<ContentListSkeleton />}>
      <ContentListPage />
    </ClientBoundary>
  )
}
