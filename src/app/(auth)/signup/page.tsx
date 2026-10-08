import type { Metadata } from "next"
import { SignupForm } from "@/components/Auth/SignupForm"

export const metadata: Metadata = { title: "Create account" }

export default function Page() {
  return <SignupForm />
}
