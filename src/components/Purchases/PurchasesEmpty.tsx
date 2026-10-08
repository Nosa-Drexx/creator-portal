"use client"

import Link from "next/link"
import { Search01Icon, ShoppingBag02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/EmptyState"
import { routes } from "@/constants/routes"
import { useWorkspace } from "@/hooks/queries/use-workspace"

interface PurchasesEmptyProps {
  filtered: boolean
  onClear: () => void
}

export function PurchasesEmpty({ filtered, onClear }: PurchasesEmptyProps) {
  const { data: workspace } = useWorkspace()

  if (filtered) {
    return (
      <EmptyState
        icon={Search01Icon}
        title="No purchases match"
        description="Try a different search term or status."
        action={
          <Button variant="outline" onClick={onClear}>
            Clear filters
          </Button>
        }
      />
    )
  }

  if (workspace && !workspace.canPublish) {
    return (
      <EmptyState
        icon={ShoppingBag02Icon}
        title="No purchases yet"
        description="Verify your identity and publish your first video. Sales will show up here the moment they happen."
        action={
          <Button asChild>
            <Link href={routes.verification(workspace.slug)}>Verify identity</Link>
          </Button>
        }
      />
    )
  }

  return (
    <EmptyState
      icon={ShoppingBag02Icon}
      title="No purchases yet"
      description="Share your published videos with your audience. Every sale will appear here with its buyer and status."
      action={
        workspace && (
          <Button asChild variant="outline">
            <Link href={routes.content(workspace.slug)}>Go to content</Link>
          </Button>
        )
      }
    />
  )
}
