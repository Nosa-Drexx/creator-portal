"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { routes } from "@/constants/routes"
import { EContentStatus } from "@/enums/content"
import { EErrorCode } from "@/enums/errors"
import { useSaveContent } from "@/hooks/mutations/use-content-mutations"
import { useWorkspace } from "@/hooks/queries/use-workspace"
import { customToast } from "@/hooks/use-toast"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { usePermissions } from "@/hooks/use-permissions"
import { getApiError, isApiErrorCode } from "@/lib/axios"
import type { Content } from "@/types/content"
import { contentFormSchema, defaultScheduleTime, toPayload, type ContentFormValues } from "./schema"

export type PublishLock = "permission" | "verification" | null

export const notifyPublishBlocked = () =>
  customToast("info", "Your role can't publish videos. Save it as a draft and an admin can publish it.")

const SUCCESS_COPY: Record<EContentStatus, string> = {
  [EContentStatus.Draft]: "Draft saved",
  [EContentStatus.Published]: "Your video is live",
  [EContentStatus.Scheduled]: "Your video is scheduled",
}

/** Media fields aren't focusable inputs, so bring whichever error comes first into view */
function revealFirstError() {
  requestAnimationFrame(() => {
    document.querySelector('[aria-invalid="true"], [data-slot="field-error"], .text-danger')?.scrollIntoView({ behavior: "smooth", block: "center" })
  })
}

export function useContentForm(defaults: ContentFormValues, existing?: Content) {
  const slug = useWorkspaceSlug()
  const router = useRouter()
  const { data: workspace } = useWorkspace()
  const save = useSaveContent(existing?.id)
  const [uploads, setUploads] = useState({ thumbnail: false, video: false })
  const [verifyPrompt, setVerifyPrompt] = useState(false)

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: defaults,
    mode: "onTouched",
  })

  const isUploading = uploads.thumbnail || uploads.video
  const { has } = usePermissions()
  const canPublish = workspace?.canPublish ?? false
  // Role is checked first: an editor in a verified workspace still can't publish
  const lockReason: PublishLock = canPublish ? null : !has("publish:content") ? "permission" : "verification"
  const { isDirty } = form.formState

  // Native guard for tab close / refresh with unsaved work
  useEffect(() => {
    if (!isDirty && !isUploading) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [isDirty, isUploading])

  const setThumbUploading = useCallback((v: boolean) => setUploads((u) => ({ ...u, thumbnail: v })), [])
  const setVideoUploading = useCallback((v: boolean) => setUploads((u) => ({ ...u, video: v })), [])

  const persist = async (values: ContentFormValues, status: EContentStatus, then?: (content: Content) => void) => {
    try {
      const saved = await save.mutateAsync(toPayload(values, status))
      customToast("success", existing?.status === status ? "Changes saved" : SUCCESS_COPY[status])
      form.reset(values)
      if (then) then(saved)
      else router.push(routes.contentDetail(slug, saved.id))
    } catch (error) {
      if (isApiErrorCode(error, EErrorCode.VerificationRequired)) {
        setVerifyPrompt(true)
        return
      }
      const fieldErrors = getApiError(error)?.fieldErrors ?? {}
      Object.entries(fieldErrors).forEach(([field, messages]) => {
        const name = (field === "priceCents" ? "price" : field) as keyof ContentFormValues
        form.setError(name, { message: messages[0] })
      })
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    if (values.status !== EContentStatus.Draft && lockReason) {
      if (lockReason === "permission") notifyPublishBlocked()
      else setVerifyPrompt(true)
      return
    }
    return persist(values, values.status)
  }, revealFirstError)

  const saveAsDraft = async (then?: (content: Content) => void) => {
    form.setValue("status", EContentStatus.Draft)
    const valid = await form.trigger(["title", "description", "price"])
    if (!valid) {
      setVerifyPrompt(false)
      return
    }
    await persist(form.getValues(), EContentStatus.Draft, then)
    setVerifyPrompt(false)
  }

  const saveAndVerify = () => saveAsDraft(() => router.push(routes.verification(slug)))

  const selectStatus = (status: EContentStatus) => {
    form.setValue("status", status, { shouldDirty: true })
    if (status === EContentStatus.Scheduled && !form.getValues("scheduledFor")) {
      form.setValue("scheduledFor", defaultScheduleTime())
    }
  }

  return {
    form,
    onSubmit,
    isSaving: save.isPending,
    isUploading,
    canPublish,
    lockReason,
    verificationStatus: workspace?.verificationStatus,
    setThumbUploading,
    setVideoUploading,
    selectStatus,
    verifyPrompt,
    setVerifyPrompt,
    saveAsDraft: () => saveAsDraft(),
    saveAndVerify,
  }
}
