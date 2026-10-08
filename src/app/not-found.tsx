import type { Metadata } from "next"
import Link from "next/link"
import { Unlink01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/EmptyState"
import { Logo } from "@/components/shared/Logo"

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } }

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-background px-4 py-6 sm:px-8">
      <Link href="/" aria-label="CreatorHub home" className="self-start">
        <Logo />
      </Link>
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          icon={Unlink01Icon}
          title="This page doesn't exist"
          description="The link may be broken, or the page may have moved."
          action={
            <Button asChild>
              <Link href="/">Back to CreatorHub</Link>
            </Button>
          }
        />
      </div>
    </div>
  )
}
