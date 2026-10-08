import type { Metadata } from "next"
import { ClientBoundary } from "@/components/shared/ClientBoundary"
import { RequirePermission } from "@/components/shared/Permissions"
import { EModule } from "@/constants/permissions"
import { VerificationPage } from "@/components/Verification/VerificationPage"
import { VerificationSkeleton } from "@/components/Verification/VerificationSkeleton"

export const metadata: Metadata = { title: "Verification" }

export default function Page() {
  return (
    <ClientBoundary fallback={<VerificationSkeleton />}>
      <RequirePermission module={EModule.Verification} fallback={<VerificationSkeleton />}>
        <VerificationPage />
      </RequirePermission>
    </ClientBoundary>
  )
}
