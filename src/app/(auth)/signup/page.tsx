import type { Metadata } from "next"
import { SignupForm } from "@/components/Auth/SignupForm"
import { ClientBoundary } from "@/components/shared/ClientBoundary"

export const metadata: Metadata = { title: "Create account" }

export default function Page() {
  return (
    <ClientBoundary fallback={null}>
      <SignupForm />
    </ClientBoundary>
  )
}
