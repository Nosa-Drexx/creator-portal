import type { Metadata } from "next"
import { ClientBoundary } from "@/components/shared/ClientBoundary"
import { InviteLinkPage } from "@/components/Invitations/InviteLinkPage"

export const metadata: Metadata = { title: "Workspace invitation" }

export default function Page() {
  return (
    <ClientBoundary fallback={null}>
      <InviteLinkPage />
    </ClientBoundary>
  )
}
