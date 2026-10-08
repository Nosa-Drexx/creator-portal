"use client"

import { useWatch } from "react-hook-form"
import { HugeiconsIcon } from "@hugeicons/react"
import { SquareLock02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { SectionCard } from "@/components/shared/SectionCard"
import { EContentStatus } from "@/enums/content"
import { EVerificationStatus } from "@/enums/verification"
import type { Content } from "@/types/content"
import { DetailsSection } from "./DetailsSection"
import { LivePreview } from "./LivePreview"
import { MediaSection } from "./MediaSection"
import { PublishOptions } from "./PublishOptions"
import type { ContentFormValues } from "./schema"
import { notifyPublishBlocked, useContentForm } from "./use-content-form"
import { VerifyToPublishModal } from "./VerifyToPublishModal"

const SUBMIT_LABEL: Record<EContentStatus, string> = {
  [EContentStatus.Draft]: "Save draft",
  [EContentStatus.Published]: "Publish now",
  [EContentStatus.Scheduled]: "Schedule",
}

interface ContentFormProps {
  defaults: ContentFormValues
  existing?: Content
}

export function ContentForm({ defaults, existing }: ContentFormProps) {
  const vm = useContentForm(defaults, existing)
  const { form } = vm
  const [status, scheduledFor] = useWatch({ control: form.control, name: ["status", "scheduledFor"] })
  const label = vm.isUploading
    ? "Waiting for upload…"
    : existing && status === existing.status
      ? "Save changes"
      : SUBMIT_LABEL[status]

  const onLocked = () => (vm.lockReason === "permission" ? notifyPublishBlocked() : vm.setVerifyPrompt(true))

  const submitButton = (className?: string) => (
    <Button
      type="submit"
      size="xl"
      variant={status === EContentStatus.Draft ? "default" : "brand"}
      isLoading={vm.isSaving}
      disabled={vm.isUploading}
      className={className}
    >
      {label}
    </Button>
  )

  return (
    <form onSubmit={vm.onSubmit} noValidate className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
      <div className="flex min-w-0 flex-col gap-5">
        <DetailsSection form={form} />
        <MediaSection
          form={form}
          videoFileName={existing?.videoFileName}
          onThumbUploading={vm.setThumbUploading}
          onVideoUploading={vm.setVideoUploading}
        />
        <div className="lg:hidden">
          <SectionCard title="Visibility" bodyClassName="p-4">
            <PublishOptions
              value={status}
              onChange={vm.selectStatus}
              scheduledFor={scheduledFor}
              onScheduledForChange={(v) => form.setValue("scheduledFor", v, { shouldDirty: true, shouldValidate: true })}
              scheduleError={form.formState.errors.scheduledFor?.message}
              canPublish={vm.canPublish}
              lockReason={vm.lockReason}
              onLockedSelect={onLocked}
            />
          </SectionCard>
        </div>
      </div>

      <aside className="sticky top-8 hidden flex-col gap-5 lg:flex">
        <SectionCard title="Visibility" bodyClassName="gap-4 p-4">
          <PublishOptions
            value={status}
            onChange={vm.selectStatus}
            scheduledFor={scheduledFor}
            onScheduledForChange={(v) => form.setValue("scheduledFor", v, { shouldDirty: true, shouldValidate: true })}
            scheduleError={form.formState.errors.scheduledFor?.message}
            canPublish={vm.canPublish}
            lockReason={vm.lockReason}
            onLockedSelect={onLocked}
          />
          {vm.lockReason && (
            <p className="flex items-start gap-2 rounded-lg bg-warning-surface p-2.5 text-xs leading-relaxed text-text-secondary">
              <HugeiconsIcon icon={SquareLock02Icon} size={14} className="mt-0.5 shrink-0 text-warning" />
              {vm.lockReason === "permission"
                ? "Your role can save drafts but not publish. An admin can publish it for you."
                : "Publishing unlocks after identity verification. You can save drafts any time."}
            </p>
          )}
          {submitButton("w-full")}
        </SectionCard>
        <LivePreview control={form.control} />
      </aside>

      {/* Thumb-reach action bar; the tab bar is hidden on editor pages */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stroke bg-surface/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        {submitButton("w-full")}
      </div>

      <VerifyToPublishModal
        open={vm.verifyPrompt}
        onOpenChange={vm.setVerifyPrompt}
        verificationStatus={vm.verificationStatus ?? EVerificationStatus.Unverified}
        onSaveDraft={vm.saveAsDraft}
        onVerify={vm.saveAndVerify}
        isSaving={vm.isSaving}
      />
    </form>
  )
}
