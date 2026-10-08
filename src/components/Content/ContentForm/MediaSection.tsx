"use client"

import { useRef } from "react"
import { Controller, type UseFormReturn } from "react-hook-form"
import { Field } from "@/components/shared/forms/Field"
import { SectionCard } from "@/components/shared/SectionCard"
import type { ContentFormValues } from "./schema"
import { ThumbnailField, type ThumbnailFieldHandle } from "./ThumbnailField"
import { VideoField } from "./VideoField"

interface MediaSectionProps {
  form: UseFormReturn<ContentFormValues>
  videoFileName?: string | null
  onThumbUploading: (v: boolean) => void
  onVideoUploading: (v: boolean) => void
}

export function MediaSection({ form, videoFileName, onThumbUploading, onVideoUploading }: MediaSectionProps) {
  const thumbnailRef = useRef<ThumbnailFieldHandle>(null)
  const { errors } = form.formState

  return (
    <SectionCard title="Media" description="Uploads run in the background while you fill in the rest." bodyClassName="gap-5 p-4 sm:p-5">
      <Field label="Video" error={errors.videoKey?.message}>
        <Controller
          control={form.control}
          name="videoKey"
          render={({ field }) => (
            <VideoField
              value={field.value}
              fileName={videoFileName}
              onChange={(key, duration) => {
                field.onChange(key)
                form.setValue("durationSeconds", duration, { shouldDirty: true })
                if (key) form.clearErrors("videoKey")
              }}
              onUploadingChange={onVideoUploading}
              onUseFrame={(frame) => void thumbnailRef.current?.start(frame)}
              error={errors.videoKey?.message}
            />
          )}
        />
      </Field>
      <Field label="Thumbnail" error={errors.thumbnailKey?.message} className="sm:max-w-[420px]">
        <Controller
          control={form.control}
          name="thumbnailKey"
          render={({ field }) => (
            <ThumbnailField
              ref={thumbnailRef}
              value={field.value}
              onChange={(key) => {
                field.onChange(key)
                if (key) form.clearErrors("thumbnailKey")
              }}
              onUploadingChange={onThumbUploading}
              error={errors.thumbnailKey?.message}
            />
          )}
        />
      </Field>
    </SectionCard>
  )
}
