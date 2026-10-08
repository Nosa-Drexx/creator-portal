"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { routes } from "@/constants/routes"
import { ACCENT_COLORS, slugify } from "@/constants/workspace"
import { useCreateWorkspace } from "@/hooks/mutations/use-workspace-mutations"
import { createWorkspaceSchema, type CreateWorkspaceInput } from "@/lib/validation/workspace"

export const WORKSPACE_FORM_DEFAULTS: CreateWorkspaceInput = { name: "", handle: "", accentColor: ACCENT_COLORS[3].value }

/** Shared by the switcher modal and onboarding */
export function useCreateWorkspaceForm(onCreated?: () => void) {
  const router = useRouter()
  const create = useCreateWorkspace()
  const form = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: WORKSPACE_FORM_DEFAULTS,
    // Not onTouched: the dialog's focus handling blurs the autofocused name and flagged it as invalid on open
    mode: "onSubmit",
    reValidateMode: "onChange",
  })
  const { dirtyFields } = form.formState
  const name = useWatch({ control: form.control, name: "name" })

  // Suggest a handle from the name until the creator edits it themselves
  useEffect(() => {
    if (!dirtyFields.handle) form.setValue("handle", slugify(name).replace(/-/g, "").slice(0, 30))
  }, [name, dirtyFields.handle, form])

  const onSubmit = form.handleSubmit((values) =>
    create.mutate(values, {
      onSuccess: (workspace) => {
        onCreated?.()
        router.push(routes.overview(workspace.slug))
      },
    }),
  )

  return { form, onSubmit, isPending: create.isPending }
}
