import { ClientBoundary } from "@/components/shared/ClientBoundary"
import { PageHeader } from "@/components/shared/PageHeader"
import { MembersTabs } from "@/components/Members/MembersTabs"
import { Skeleton } from "@/components/ui/skeleton"

export default function TeamLayout({ children }: LayoutProps<"/w/[workspace]/members">) {
  return (
    <>
      <PageHeader title="Team" description="Who has access to this workspace, and what each role can do." />
      <ClientBoundary fallback={<Skeleton className="h-[38px] w-[180px] rounded-[11px]" />}>
        <MembersTabs />
      </ClientBoundary>
      {children}
    </>
  )
}
