"use client"

import { PageHeader } from "@/components/shared/PageHeader"
import { Reveal } from "@/components/shared/motion/Reveal"
import { DemoControls } from "./DemoControls"
import { WorkspaceCard } from "./WorkspaceCard"

export function SettingsPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader title="Demo & settings" description="Workspace details and controls for exploring the demo." />
      <Reveal className="flex flex-col gap-5">
        <WorkspaceCard />
        <DemoControls />
      </Reveal>
    </div>
  )
}
