import type { Metadata } from "next"
import { ClientBoundary } from "@/components/shared/ClientBoundary"
import { MembersPage } from "@/components/Members/MembersPage"
import { MembersSkeleton } from "@/components/Members/MembersSkeleton"

export const metadata: Metadata = { title: "Team" }

export default function Page() {
  return (
    <ClientBoundary fallback={<MembersSkeleton />}>
      <MembersPage />
    </ClientBoundary>
  )
}
