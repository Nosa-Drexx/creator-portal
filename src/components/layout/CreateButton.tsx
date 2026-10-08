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
    <Button asChild size="lg" variant="brand" className="w-full collapsed:size-10 collapsed:self-center collapsed:p-0">
      <Link href={routes.newContent(slug)} aria-label="Upload video">
        <HugeiconsIcon icon={Add01Icon} size={18} strokeWidth={2.2} />
        <span className="collapsed:hidden">Upload video</span>
      </Link>
    </Button>
  )
}
