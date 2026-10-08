"use client"

import { useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { HugeiconsIcon } from "@hugeicons/react"
import { CloudUploadIcon, File01Icon, RefreshIcon, Tick02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { S3Image } from "@/components/shared/S3Image"
import { UPLOAD_RULES } from "@/constants/uploads"
import type { EUploadKind } from "@/enums/uploads"
import { useFileUpload } from "@/hooks/use-file-upload"
import { formatBytes } from "@/lib/format"
import { cn } from "@/lib/utils"

interface UploadDropzoneProps {
  kind: EUploadKind
  value?: string
  onChange: (key: string) => void
  onBusyChange?: (busy: boolean) => void
  title: string
  invalid?: boolean
}

interface LocalFile {
  url: string
  name: string
  size: number
  isPdf: boolean
}

export function UploadDropzone({ kind, value, onChange, onBusyChange, title, invalid }: UploadDropzoneProps) {
  const upload = useFileUpload(kind)
  const [local, setLocal] = useState<LocalFile | null>(null)
  const rule = UPLOAD_RULES[kind]
  const busy = upload.status === "uploading"

  useEffect(() => onBusyChange?.(busy), [busy, onBusyChange])
  useEffect(() => () => void (local && URL.revokeObjectURL(local.url)), [local])

  const handleFile = async (file: File) => {
    setLocal({ url: URL.createObjectURL(file), name: file.name, size: file.size, isPdf: file.type === "application/pdf" })
    onChange("")
    const key = await upload.upload(file)
    if (key) onChange(key)
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: Object.fromEntries(rule.mimeTypes.map((type) => [type, []])),
    multiple: false,
    noClick: !!(value || local),
    onDropAccepted: ([file]) => handleFile(file),
    onDropRejected: ([rejection]) => rejection && handleFile(rejection.file),
  })

  const previewSrc = local?.url ?? value ?? null
  const isPdf = local ? local.isPdf : !!value?.toLowerCase().endsWith(".pdf")
  const hasFile = !!(local || value)

  if (!hasFile) {
    return (
      <div
        {...getRootProps()}
        className={cn(
          "group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-9 text-center transition-[border-color,background-color] duration-200",
          isDragActive ? "border-brand bg-brand-soft" : "border-stroke-strong bg-surface hover:border-ink-400 hover:bg-muted/50",
          invalid && !isDragActive && "border-danger/60",
        )}
      >
        <input {...getInputProps()} />
        <span
          className={cn(
            "grid size-12 place-items-center rounded-2xl bg-muted text-text-secondary transition-transform duration-300 ease-out-soft",
            isDragActive && "-translate-y-1 scale-105 bg-brand text-brand-foreground",
          )}
        >
          <HugeiconsIcon icon={CloudUploadIcon} size={22} />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-text-primary">
            {isDragActive ? "Drop to upload" : title}
          </p>
          <p className="text-xs text-text-tertiary">
            <span className="max-md:hidden">Drag and drop, or </span>
            <span className="font-semibold text-brand">browse files</span> · {rule.label}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div {...getRootProps()} className="flex animate-rise flex-col gap-3 rounded-2xl border border-stroke bg-surface p-3 shadow-card">
      <input {...getInputProps()} />
      <div className="flex items-center gap-3">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
          {isPdf ? (
            <div className="grid size-full place-items-center text-text-secondary">
              <HugeiconsIcon icon={File01Icon} size={24} />
            </div>
          ) : (
            <S3Image src={previewSrc} alt="Document preview" containerClassName="absolute inset-0" sizes="64px" />
          )}
          {upload.status === "success" || (!local && value) ? (
            <span className="absolute right-1 bottom-1 grid size-5 animate-pop place-items-center rounded-full bg-success text-white ring-2 ring-surface">
              <HugeiconsIcon icon={Tick02Icon} size={12} strokeWidth={3} />
            </span>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-text-primary">{local?.name ?? "Uploaded document"}</span>
          <span className="text-xs text-text-tertiary tabular">
            {busy
              ? `${formatBytes(upload.loaded)} of ${formatBytes(upload.total)} · ${upload.progress}%`
              : upload.status === "error"
                ? "Upload failed"
                : local
                  ? `${formatBytes(local.size)} · Uploaded`
                  : "Uploaded"}
          </span>
        </div>
        {busy ? (
          <Button type="button" variant="ghost" size="sm" onClick={upload.cancel}>
            Cancel
          </Button>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={open}>
            Replace
          </Button>
        )}
      </div>

      {busy && (
        <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={upload.progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-brand transition-[width] duration-300 ease-out-soft" style={{ width: `${upload.progress}%` }} />
        </div>
      )}

      {(upload.status === "error" || upload.status === "cancelled") && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-danger-surface px-3 py-2 text-xs text-danger">
          <span>{upload.error ?? "Upload cancelled."}</span>
          {upload.status === "error" && !upload.error?.startsWith("Unsupported") && !upload.error?.startsWith("File is too") && (
            <button
              type="button"
              onClick={async () => {
                const key = await upload.retry()
                if (key) onChange(key)
              }}
              className="inline-flex items-center gap-1 font-semibold">
              <HugeiconsIcon icon={RefreshIcon} size={13} /> Retry
            </button>
          )}
        </div>
      )}
    </div>
  )
}
