"use client"

import Link from "next/link"
import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/PageHeader"
import { Reveal } from "@/components/shared/motion/Reveal"
import { routes } from "@/constants/routes"
import { CanCreate, CanRead } from "@/components/shared/Permissions"
import { EModule } from "@/constants/permissions"
import { useSession } from "@/hooks/queries/use-session"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { RecentPurchasesCard } from "./RecentPurchasesCard"
import { RevenueChartCard } from "./RevenueChartCard"
import { StatsGrid } from "./StatsGrid"
import { TopContentCard } from "./TopContentCard"

function greeting() {
  const hour = new Date().getHours()
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
}

export function OverviewPage() {
  const slug = useWorkspaceSlug()
  const { data: session } = useSession()
  const firstName = session?.user.name.split(" ")[0]

  return (
    <>
      <PageHeader
        eyebrow={<span className="text-xs font-semibold text-text-tertiary">{format(new Date(), "EEEE, d MMMM")}</span>}
        title={firstName ? `${greeting()}, ${firstName}` : greeting()}
        description="Here's how your content is performing."
        actions={
          <CanCreate module={EModule.Content}>
            <Button asChild variant="outline" className="max-md:hidden">
              <Link href={routes.newContent(slug)}>
                <HugeiconsIcon icon={Add01Icon} size={16} />
                New video
              </Link>
            </Button>
          </CanCreate>
        }
      />
      <StatsGrid />
      <Reveal delay={0.1}>
        <RevenueChartCard />
      </Reveal>
      <Reveal delay={0.18} className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
        <CanRead module={EModule.Content}>
          <TopContentCard />
        </CanRead>
        <CanRead module={EModule.Purchases}>
          <RecentPurchasesCard />
        </CanRead>
      </Reveal>
    </>
  )
}
