import { WorkspaceShell } from "@/components/layout/WorkspaceShell"

export default function WorkspaceLayout({ children }: LayoutProps<"/w/[workspace]">) {
  return <WorkspaceShell>{children}</WorkspaceShell>
}
