"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { routes } from "@/constants/routes"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"

export function CreateButton() {
  const slug = useWorkspaceSlug()
  return (
    <Button asChild size="lg" variant="brand" className="w-full max-lg:size-10 max-lg:self-center max-lg:p-0">
      <Link href={routes.newContent(slug)} aria-label="Upload video">
        <HugeiconsIcon icon={Add01Icon} size={18} strokeWidth={2.2} />
        <span className="hidden lg:inline">Upload video</span>
      </Link>
    </Button>
  )
}
