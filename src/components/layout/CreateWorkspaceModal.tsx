"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { useCreateWorkspaceForm, WORKSPACE_FORM_DEFAULTS } from "@/components/Workspace/use-create-workspace-form"
import { WorkspaceFormFields } from "@/components/Workspace/WorkspaceFormFields"

interface CreateWorkspaceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateWorkspaceModal({ open, onOpenChange }: CreateWorkspaceModalProps) {
  const { form, onSubmit, isPending } = useCreateWorkspaceForm(() => onOpenChange(false))

  useEffect(() => {
    if (!open) form.reset(WORKSPACE_FORM_DEFAULTS)
  }, [open, form])

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      isPerformingAction={isPending}
      title="Create a workspace"
      description="A separate space with its own videos, sales and verification. Great for a second channel or a client you manage."
      footer={
        <>
          <Button variant="outline" size="lg" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button size="lg" onClick={onSubmit} isLoading={isPending}>
            Create workspace
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <WorkspaceFormFields form={form} />
      </form>
    </ResponsiveModal>
  )
}
