"use client"

import { useTheme } from "next-themes"
import { SectionCard } from "@/components/shared/SectionCard"
import { SegmentedControl } from "@/components/shared/SegmentedControl"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { WorkspaceAvatar } from "@/components/shared/WorkspaceAvatar"
import { VERIFICATION_STATUS } from "@/constants/status"
import { useWorkspace } from "@/hooks/queries/use-workspace"
import { SettingRow } from "./SettingRow"

export function WorkspaceCard() {
  const { data: workspace } = useWorkspace()
  const { theme = "system", setTheme } = useTheme()
  if (!workspace) return null
  const verification = VERIFICATION_STATUS[workspace.verificationStatus]

  return (
    <SectionCard bodyClassName="divide-y divide-stroke p-4 sm:p-5">
      <div className="flex items-center gap-3 pb-4">
        <WorkspaceAvatar name={workspace.name} color={workspace.accentColor} className="size-11 rounded-xl text-sm" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-base font-bold">{workspace.name}</span>
          <span className="text-[13px] text-text-tertiary">
            {workspace.handle} · {workspace.role.name}
          </span>
        </div>
        <StatusBadge tone={verification.tone} label={verification.label} />
      </div>
      <SettingRow title="Appearance" description="Use the light or dark theme, or follow your device.">
        <SegmentedControl
          aria-label="Theme"
          size="sm"
          value={theme as "light" | "dark" | "system"}
          onChange={setTheme}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "system", label: "System" },
          ]}
        />
      </SettingRow>
    </SectionCard>
  )
}
