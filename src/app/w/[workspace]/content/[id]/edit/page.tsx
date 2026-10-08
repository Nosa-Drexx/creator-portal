import type { Metadata } from "next"
import { ClientBoundary } from "@/components/shared/ClientBoundary"
import { EditContentPage } from "@/components/Content/ContentEditorPage"
import { ContentEditorSkeleton } from "@/components/Content/ContentEditorSkeleton"

export const metadata: Metadata = { title: "Edit video" }

export default function Page() {
  return (
    <ClientBoundary fallback={<ContentEditorSkeleton />}>
      <EditContentPage />
    </ClientBoundary>
  )
}
