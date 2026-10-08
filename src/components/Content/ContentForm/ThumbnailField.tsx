"use client"

import { useEffect, useImperativeHandle, useState, type Ref } from "react"
import { useDropzone } from "react-dropzone"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, Image02Icon, RefreshIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { S3Image } from "@/components/shared/S3Image"
import { UploadProgress } from "@/components/shared/UploadProgress"
import { UPLOAD_RULES } from "@/constants/uploads"
import { EUploadKind } from "@/enums/uploads"
import { useFileUpload } from "@/hooks/use-file-upload"
import { useObjectUrl } from "@/hooks/use-object-url"
import { cn } from "@/lib/utils"

export interface ThumbnailFieldHandle {
  /** Uploads a file programmatically, e.g. a frame captured from the video */
  start: (file: File) => Promise<void>
}

interface ThumbnailFieldProps {
  ref?: Ref<ThumbnailFieldHandle>
  value: string | null
  onChange: (key: string | null) => void
  onUploadingChange: (uploading: boolean) => void
  error?: string
}

const RULE = UPLOAD_RULES[EUploadKind.Thumbnail]

export function ThumbnailField({ ref, value, onChange, onUploadingChange, error }: ThumbnailFieldProps) {
  const upload = useFileUpload(EUploadKind.Thumbnail)
  const [file, setFile] = useState<File | null>(null)
  const preview = useObjectUrl(file)
  const uploading = upload.status === "uploading"

  useEffect(() => onUploadingChange(uploading), [uploading, onUploadingChange])

  const start = async (next: File) => {
    setFile(next)
    const key = await upload.upload(next)
    if (key) onChange(key)
  }

  useImperativeHandle(ref, () => ({ start }))

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: Object.fromEntries(RULE.mimeTypes.map((t) => [t, []])),
    multiple: false,
    noClick: !!value || uploading,
    onDropAccepted: ([accepted]) => void start(accepted),
    onDropRejected: ([rejected]) => void start(rejected.file),
  })

  const remove = () => {
    upload.reset()
    setFile(null)
    onChange(null)
  }

  const src = preview ?? value
  const hasImage = !!src && upload.status !== "error"

  return (
    <div className="flex flex-col gap-2">
      <div
        {...getRootProps()}
        className={cn(
          "group relative aspect-video overflow-hidden rounded-xl border border-dashed transition-[border-color,background-color] duration-200",
          hasImage ? "border-transparent" : "cursor-pointer border-stroke-strong bg-muted/40 hover:border-brand/60 hover:bg-brand-soft",
          isDragActive && "border-brand bg-brand-soft",
          error && !hasImage && "border-danger/60",
        )}
      >
        <input {...getInputProps()} aria-label="Upload thumbnail" />
        {hasImage ? (
          <>
            <S3Image src={src} alt="Thumbnail preview" containerClassName="absolute inset-0" sizes="400px" />
            {uploading && <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />}
            {!uploading && (
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-linear-to-t from-black/55 to-transparent p-2.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                <Button type="button" size="xs" variant="secondary" onClick={open}>
                  <HugeiconsIcon icon={RefreshIcon} size={13} />
                  Replace
                </Button>
                <Button type="button" size="xs" variant="secondary" onClick={remove} aria-label="Remove thumbnail">
                  <HugeiconsIcon icon={Delete02Icon} size={13} />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
            <span className="grid size-10 place-items-center rounded-xl bg-surface text-text-secondary shadow-card transition-transform duration-300 ease-out-soft group-hover:-translate-y-0.5">
              <HugeiconsIcon icon={Image02Icon} size={19} />
            </span>
            <p className="text-[13px] font-semibold text-text-primary">
              {isDragActive ? "Drop to upload" : "Drop a thumbnail or browse"}
            </p>
            <p className="text-xs text-text-tertiary">{RULE.label} · 16:9 works best</p>
          </div>
        )}
      </div>
      {upload.status !== "idle" && upload.status !== "success" && upload.status !== "cancelled" && (
        <UploadProgress
          state={upload}
          onCancel={() => {
            upload.cancel()
            setFile(null)
          }}
          onRetry={upload.retry}
        />
      )}
    </div>
  )
}
