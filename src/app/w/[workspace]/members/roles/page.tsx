import type { Metadata } from "next"
import { ClientBoundary } from "@/components/shared/ClientBoundary"
import { RolesPage } from "@/components/Roles/RolesPage"
import { RolesSkeleton } from "@/components/Roles/RolesSkeleton"

export const metadata: Metadata = { title: "Roles" }

export default function Page() {
  return (
    <ClientBoundary fallback={<RolesSkeleton />}>
      <RolesPage />
    </ClientBoundary>
  )
}
