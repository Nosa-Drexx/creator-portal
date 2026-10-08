"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, MoreHorizontalIcon, PencilEdit02Icon, ViewIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { routes } from "@/constants/routes"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import type { Content } from "@/types/content"

interface ContentActionsMenuProps {
  item: Content
  onDelete: (item: Content) => void
}

export function ContentActionsMenu({ item, onDelete }: ContentActionsMenuProps) {
  const slug = useWorkspaceSlug()
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions for ${item.title}`}
          onClick={(e) => e.stopPropagation()}
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem asChild className="gap-2.5 rounded-lg">
          <Link href={routes.contentDetail(slug, item.id)}>
            <HugeiconsIcon icon={ViewIcon} size={16} />
            View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2.5 rounded-lg">
          <Link href={routes.editContent(slug, item.id)}>
            <HugeiconsIcon icon={PencilEdit02Icon} size={16} />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="gap-2.5 rounded-lg"
          onSelect={() => onDelete(item)}
        >
          <HugeiconsIcon icon={Delete02Icon} size={16} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
