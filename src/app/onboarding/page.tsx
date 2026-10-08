import type { Metadata } from "next"
import { ClientBoundary } from "@/components/shared/ClientBoundary"
import { OnboardingPage } from "@/components/Workspace/OnboardingPage"

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Set up your workspace" }

export default function Page() {
  return (
    <ClientBoundary fallback={null}>
      <OnboardingPage />
    </ClientBoundary>
  )
}
