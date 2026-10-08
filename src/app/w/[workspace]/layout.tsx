import type { Metadata } from "next"
import { WorkspaceShell } from "@/components/layout/WorkspaceShell"

// Private, signed-in pages should never appear in search results
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function WorkspaceLayout({ children }: LayoutProps<"/w/[workspace]">) {
  return <WorkspaceShell>{children}</WorkspaceShell>
}
