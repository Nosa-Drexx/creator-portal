import type { Metadata } from "next"
import { ClientBoundary } from "@/components/shared/ClientBoundary"
import { SettingsPage } from "@/components/Settings/SettingsPage"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = { title: "Demo & settings" }

export default function Page() {
  return (
    <ClientBoundary fallback={<Skeleton className="h-96 max-w-3xl rounded-2xl" />}>
      <SettingsPage />
    </ClientBoundary>
  )
}
