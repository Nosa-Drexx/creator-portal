import type { Metadata } from "next"
import { ClientBoundary } from "@/components/shared/ClientBoundary"
import { ContentDetailPage } from "@/components/Content/ContentDetail/ContentDetailPage"
import { ContentDetailSkeleton } from "@/components/Content/ContentDetail/ContentDetailSkeleton"

export const metadata: Metadata = { title: "Video" }

export default function Page() {
  return (
    <ClientBoundary fallback={<ContentDetailSkeleton />}>
      <ContentDetailPage />
    </ClientBoundary>
  )
}
