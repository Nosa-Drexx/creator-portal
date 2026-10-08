import { ClientBoundary } from "@/components/shared/ClientBoundary"
import { Skeleton } from "@/components/ui/skeleton"
import { MobileTabBar } from "./MobileTabBar"
import { MobileTopBar } from "./MobileTopBar"
import { Sidebar } from "./Sidebar"
import { SidebarSkeleton } from "./ShellSkeleton"
import { VerificationBanner } from "./VerificationBanner"
import { WorkspaceBrand } from "./WorkspaceBrand"
import { WorkspaceGate } from "./WorkspaceGate"

/**
 * Static frame; every tenant-aware piece reads the URL, so each streams in
 * behind its own small boundary while pages render straight into <main>.
 */
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <ClientBoundary fallback={<SidebarSkeleton />}>
        <Sidebar />
      </ClientBoundary>
      <div className="flex min-w-0 flex-1 flex-col">
        <ClientBoundary fallback={<div className="h-14 border-b border-stroke md:hidden" />}>
          <MobileTopBar />
        </ClientBoundary>
        <main className="page-container flex flex-1 flex-col gap-6 pt-5 pb-28 md:pt-8 md:pb-12">
          <ClientBoundary fallback={null}>
            <VerificationBanner />
          </ClientBoundary>
          {children}
        </main>
      </div>
      <ClientBoundary fallback={<Skeleton className="fixed inset-x-0 bottom-0 h-16 rounded-none md:hidden" />}>
        <MobileTabBar />
      </ClientBoundary>
      <ClientBoundary fallback={null}>
        <WorkspaceBrand />
        <WorkspaceGate />
      </ClientBoundary>
    </div>
  )
}
