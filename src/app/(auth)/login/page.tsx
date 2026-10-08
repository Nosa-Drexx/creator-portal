import type { Metadata } from "next"
import { LoginForm } from "@/components/Auth/LoginForm"
import { ClientBoundary } from "@/components/shared/ClientBoundary"

export const metadata: Metadata = { title: "Log in" }

export default function Page() {
  return (
    <ClientBoundary fallback={null}>
      <LoginForm />
    </ClientBoundary>
  )
}
