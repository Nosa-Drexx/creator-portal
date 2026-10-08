import type { Metadata } from "next"
import { ClientBoundary } from "@/components/shared/ClientBoundary"
import { RequirePermission } from "@/components/shared/Permissions"
import { EModule } from "@/constants/permissions"
import { PurchasesPage } from "@/components/Purchases/PurchasesPage"
import { PurchasesSkeleton } from "@/components/Purchases/PurchasesSkeleton"

export const metadata: Metadata = { title: "Purchases" }

export default function Page() {
  return (
    <ClientBoundary fallback={<PurchasesSkeleton />}>
      <RequirePermission module={EModule.Purchases} fallback={<PurchasesSkeleton />}>
        <PurchasesPage />
      </RequirePermission>
    </ClientBoundary>
  )
}
