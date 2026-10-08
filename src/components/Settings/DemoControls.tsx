"use client"

import { useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, RefreshIcon, TestTube01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { ConfirmationModal } from "@/components/shared/ConfirmationModal"
import { SectionCard } from "@/components/shared/SectionCard"
import { SegmentedControl } from "@/components/shared/SegmentedControl"
import { EDemoFault } from "@/constants/demo"
import { routes } from "@/constants/routes"
import { EVerificationStatus } from "@/enums/verification"
import { useResetDemo, useSetDemoFault, useSetDemoVerification } from "@/hooks/mutations/use-demo-mutations"
import { useDemoState } from "@/hooks/queries/use-demo-state"
import { useWorkspace } from "@/hooks/queries/use-workspace"
import { SettingRow } from "./SettingRow"
import { CanManage } from "@/components/shared/Permissions"
import { EModule } from "@/constants/permissions"

const VERIFICATION_OPTIONS = [
  { value: EVerificationStatus.Unverified, label: "Unverified" },
  { value: EVerificationStatus.Pending, label: "In review" },
  { value: EVerificationStatus.Verified, label: "Verified" },
]

const FAULT_OPTIONS = [
  { value: EDemoFault.None, label: "Normal" },
  { value: EDemoFault.Slow, label: "Slow" },
  { value: EDemoFault.Fail, label: "Failing" },
]

export function DemoControls() {
  const { data: workspace } = useWorkspace()
  const { data: demo } = useDemoState()
  const setVerification = useSetDemoVerification()
  const setFault = useSetDemoFault()
  const reset = useResetDemo()
  const [confirmReset, setConfirmReset] = useState(false)

  if (!workspace) return null
  const verification =
    workspace.verificationStatus === EVerificationStatus.Rejected ? EVerificationStatus.Unverified : workspace.verificationStatus

  return (
    <SectionCard
      title={
        <span className="flex items-center gap-2">
          <HugeiconsIcon icon={TestTube01Icon} size={17} className="text-brand" />
          Reviewer controls
        </span>
      }
      description="Jump between demo states without editing the database. These wouldn't exist in production."
      bodyClassName="divide-y divide-stroke p-4 sm:p-5"
    >
      <CanManage module={EModule.Verification}>
      <SettingRow
        title="Verification state"
        description={`Switch ${workspace.name} between states to see how publishing is gated. "In review" auto-approves after ~20 seconds.`}
      >
        <SegmentedControl
          aria-label="Verification state"
          size="sm"
          value={verification}
          onChange={(status) => setVerification.mutate({ workspace: workspace.slug, status })}
          options={VERIFICATION_OPTIONS}
        />
      </SettingRow>
      </CanManage>
      <SettingRow
        title="API behaviour"
        description="Slow adds ~2s to every request to show loading states. Failing returns 503s to show error states and retries."
      >
        <SegmentedControl
          aria-label="API behaviour"
          size="sm"
          value={demo?.fault ?? EDemoFault.None}
          onChange={(value) => setFault.mutate(value)}
          options={FAULT_OPTIONS}
        />
      </SettingRow>
      <SettingRow
        title="Tenant isolation"
        description="Open a workspace owned by another creator. The API returns 404 and you never see their data."
      >
        <Button asChild variant="outline" size="sm">
          <Link href={routes.overview("northbound-films")}>
            Try another workspace
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </Link>
        </Button>
      </SettingRow>
      <SettingRow
        title="Reset demo data"
        description="Restores the seeded workspaces, 30 videos and 1,831 purchases. Uploaded files are cleared."
      >
        <Button variant="outline" size="sm" onClick={() => setConfirmReset(true)}>
          <HugeiconsIcon icon={RefreshIcon} size={14} />
          Reset everything
        </Button>
      </SettingRow>

      <ConfirmationModal
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Reset all demo data?"
        description="Anything you've created or uploaded will be removed and the original seed data restored."
        confirmLabel="Reset data"
        icon={RefreshIcon}
        isLoading={reset.isPending}
        onConfirm={() => reset.mutate(undefined, { onSuccess: () => setConfirmReset(false) })}
      />
    </SectionCard>
  )
}
