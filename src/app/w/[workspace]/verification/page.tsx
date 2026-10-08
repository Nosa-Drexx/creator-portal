import type { Metadata } from "next"
import { ClientBoundary } from "@/components/shared/ClientBoundary"
import { VerificationPage } from "@/components/Verification/VerificationPage"
import { VerificationSkeleton } from "@/components/Verification/VerificationSkeleton"

export const metadata: Metadata = { title: "Verification" }

export default function Page() {
  return (
    <ClientBoundary fallback={<VerificationSkeleton />}>
      <VerificationPage />
    </ClientBoundary>
  )
}
