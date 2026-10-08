"use client"

import { useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { HugeiconsIcon } from "@hugeicons/react"
import { CloudUploadIcon, Delete02Icon, Image02Icon, RefreshIcon, Video01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { UploadProgress } from "@/components/shared/UploadProgress"
import { UPLOAD_RULES } from "@/constants/uploads"
import { EUploadKind } from "@/enums/uploads"
import { useFileUpload } from "@/hooks/use-file-upload"
import { useObjectUrl } from "@/hooks/use-object-url"
import { useSignedUrl } from "@/hooks/use-signed-url"
import { formatBytes, formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"
import { captureCurrentFrame, captureVideoFrame, readVideoDuration } from "@/lib/video"

interface VideoFieldProps {
  value: string | null
  fileName?: string | null
  onChange: (key: string | null, durationSeconds: number | null) => void
  onUploadingChange: (uploading: boolean) => void
  onUseFrame: (frame: File) => void
  error?: string
}

const RULE = UPLOAD_RULES[EUploadKind.Video]

export function VideoField({ value, fileName, onChange, onUploadingChange, onUseFrame, error }: VideoFieldProps) {
  const upload = useFileUpload(EUploadKind.Video)
  const [file, setFile] = useState<File | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [capturing, setCapturing] = useState(false)
  const playerRef = useRef<HTMLVideoElement>(null)
  // Ignores results from a file that has since been replaced
  const attemptRef = useRef(0)
  const localUrl = useObjectUrl(file)
  const { signedUrl } = useSignedUrl(file ? null : value)
  const playable = localUrl ?? signedUrl
  const uploading = upload.status === "uploading"

  useEffect(() => onUploadingChange(uploading), [uploading, onUploadingChange])

  const start = async (next: File) => {
    const attempt = ++attemptRef.current
    let seconds: number | null = null
    let key: string | null = null
    setFile(next)
    // Upload straight away; the duration fills in whenever the browser manages to read it
    void readVideoDuration(next).then((value) => {
      if (attempt !== attemptRef.current) return
      seconds = value
      setDuration(value)
      if (key) onChange(key, value)
    })
    key = await upload.upload(next)
    if (key && attempt === attemptRef.current) onChange(key, seconds)
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: Object.fromEntries(RULE.mimeTypes.map((t) => [t, []])),
    multiple: false,
    noClick: !!value || uploading,
    onDropAccepted: ([accepted]) => void start(accepted),
    onDropRejected: ([rejected]) => void start(rejected.file),
  })

  const remove = () => {
    attemptRef.current++
    upload.reset()
    setFile(null)
    setDuration(null)
    onChange(null, null)
  }

  const cancel = () => {
    attemptRef.current++
    upload.cancel()
    setFile(null)
    setDuration(null)
  }

  const useFrame = async () => {
    if (!playable) return
    setCapturing(true)
    const player = playerRef.current
    // Prefer the exact frame on screen; fall back to the same timestamp on a hidden copy
    const frame = (player && (await captureCurrentFrame(player))) ?? (await captureVideoFrame(playable, player?.currentTime ?? 1))
    setCapturing(false)
    if (frame) onUseFrame(frame)
  }

  const showEmpty = !file && !value

  return (
    <div className="flex flex-col gap-3">
      <div
        {...getRootProps()}
        className={cn(
          "group relative overflow-hidden rounded-xl border border-dashed transition-[border-color,background-color] duration-200",
          showEmpty
            ? "cursor-pointer border-stroke-strong bg-muted/40 hover:border-brand/60 hover:bg-brand-soft"
            : "border-stroke bg-surface",
          isDragActive && "border-brand bg-brand-soft",
          error && showEmpty && "border-danger/60",
        )}
      >
        <input {...getInputProps()} aria-label="Upload video" />
        {showEmpty ? (
          <div className="flex flex-col items-center justify-center gap-2.5 px-4 py-10 text-center sm:py-12">
            <span className="grid size-12 place-items-center rounded-2xl bg-surface text-brand shadow-card transition-transform duration-300 ease-out-soft group-hover:-translate-y-1">
              <HugeiconsIcon icon={CloudUploadIcon} size={22} />
            </span>
            <p className="text-sm font-semibold text-text-primary">
              {isDragActive ? "Drop your video to start uploading" : "Drag your video here, or browse"}
            </p>
            <p className="text-xs text-text-tertiary">{RULE.label}. Upload starts right away; keep editing while it runs.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-3">
            {playable && upload.status !== "error" ? (
              <video
                ref={playerRef}
                src={playable}
                controls
                playsInline
                preload="auto"
                className="aspect-video w-full rounded-lg bg-black"
              />
            ) : (
              <div className="grid aspect-video w-full place-items-center rounded-lg bg-muted text-text-tertiary">
                <HugeiconsIcon icon={Video01Icon} size={28} />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[13px] font-semibold">{file?.name ?? fileName ?? "Uploaded video"}</span>
                <span className="text-xs text-text-tertiary tabular">
                  {file ? formatBytes(file.size) : "Stored"}
                  {duration ? ` · ${formatDuration(Math.round(duration))}` : ""}
                </span>
              </div>
              {!uploading && (
                <div className="flex gap-1.5">
                  {playable && (
                    <Button type="button" size="xs" variant="outline" onClick={useFrame} isLoading={capturing}>
                      <HugeiconsIcon icon={Image02Icon} size={13} />
                      Use this frame as thumbnail
                    </Button>
                  )}
                  <Button type="button" size="xs" variant="outline" onClick={open}>
                    <HugeiconsIcon icon={RefreshIcon} size={13} />
                    Replace
                  </Button>
                  <Button type="button" size="xs" variant="outline" onClick={remove} aria-label="Remove video">
                    <HugeiconsIcon icon={Delete02Icon} size={13} />
                  </Button>
                </div>
              )}
            </div>
            {(upload.status === "uploading" || upload.status === "error") && (
              <UploadProgress state={upload} onCancel={cancel} onRetry={upload.retry} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
