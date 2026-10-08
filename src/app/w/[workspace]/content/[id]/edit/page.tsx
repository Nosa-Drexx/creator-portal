import type { Metadata } from "next"
import { ClientBoundary } from "@/components/shared/ClientBoundary"
import { RequirePermission } from "@/components/shared/Permissions"
import { EAction, EModule } from "@/constants/permissions"
import { EditContentPage } from "@/components/Content/ContentEditorPage"
import { ContentEditorSkeleton } from "@/components/Content/ContentEditorSkeleton"

export const metadata: Metadata = { title: "Edit video" }

export default function Page() {
  return (
    <ClientBoundary fallback={<ContentEditorSkeleton />}>
      <RequirePermission module={EModule.Content} action={EAction.Edit} fallback={<ContentEditorSkeleton />}>
        <EditContentPage />
      </RequirePermission>
    </ClientBoundary>
  )
}
