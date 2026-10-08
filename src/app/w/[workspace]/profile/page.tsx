import type { Metadata } from "next"
import { ClientBoundary } from "@/components/shared/ClientBoundary"
import { ProfilePage } from "@/components/Profile/ProfilePage"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = { title: "Your profile" }

export default function Page() {
  return (
    <ClientBoundary fallback={<Skeleton className="h-96 max-w-3xl rounded-2xl" />}>
      <ProfilePage />
    </ClientBoundary>
  )
}
