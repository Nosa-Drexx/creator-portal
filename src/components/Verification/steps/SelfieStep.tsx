"use client"

import { useEffect, useRef, useState } from "react"
import { useFormContext } from "react-hook-form"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, Camera01Icon, RefreshIcon, Tick02Icon, Upload04Icon, UserIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { FormField, FormItem, FormMessage } from "@/components/ui/form"
import { S3Image } from "@/components/shared/S3Image"
import { EUploadKind } from "@/enums/uploads"
import { useFileUpload } from "@/hooks/use-file-upload"
import type { VerificationFormValues } from "@/lib/validation/verification"
import { cn } from "@/lib/utils"
import { FIELD_MESSAGE } from "./PersonalInfoStep"
import { StepHeading } from "./StepHeading"
import { useCamera } from "./use-camera"

const RING = 2 * Math.PI * 48

function ProgressRing({ progress }: { progress: number }) {
  return (
    <svg viewBox="0 0 100 100" className="pointer-events-none absolute -inset-2 -rotate-90" aria-hidden>
      <circle cx="50" cy="50" r="48" fill="none" stroke="var(--stroke)" strokeWidth="1.5" />
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="none"
        stroke="var(--brand)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray={RING}
        strokeDashoffset={RING * (1 - progress / 100)}
        className="transition-[stroke-dashoffset] duration-300 ease-out-soft"
      />
    </svg>
  )
}

export function SelfieStep({ onBusyChange }: { onBusyChange: (busy: boolean) => void }) {
  const form = useFormContext<VerificationFormValues>()
  const camera = useCamera()
  const upload = useFileUpload(EUploadKind.Selfie)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const selfieKey = form.watch("selfieKey")
  const busy = upload.status === "uploading"
  const cameraBlocked = camera.status === "denied" || camera.status === "unsupported" || camera.status === "error"

  useEffect(() => onBusyChange(busy), [busy, onBusyChange])
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview])

  const submitFile = async (file: File) => {
    camera.stop()
    setPreview(URL.createObjectURL(file))
    form.setValue("selfieKey", "")
    const key = await upload.upload(file)
    if (key) form.setValue("selfieKey", key, { shouldValidate: true, shouldDirty: true })
  }

  const takePhoto = async () => {
    const file = await camera.capture()
    if (file) submitFile(file)
  }

  const retake = () => {
    upload.reset()
    setPreview(null)
    form.setValue("selfieKey", "")
    camera.start()
  }

  const showResult = !!(preview || selfieKey)
  const live = camera.status === "live" || camera.status === "starting"

  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        title="Take a quick selfie"
        description="We compare it with your document photo to confirm it's really you."
      />

      <FormField
        control={form.control}
        name="selfieKey"
        render={() => (
          <FormItem className="flex flex-col items-center gap-5">
            <div className="relative size-56 sm:size-64">
              {busy && <ProgressRing progress={upload.progress} />}
              <div
                className={cn(
                  "relative size-full overflow-hidden rounded-full bg-muted ring-1 ring-stroke",
                  live && "ring-2 ring-brand",
                )}
              >
                {showResult ? (
                  <S3Image src={preview ?? selfieKey} alt="Your selfie" containerClassName="absolute inset-0" sizes="256px" />
                ) : (
                  <>
                    <video
                      ref={camera.videoRef}
                      playsInline
                      muted
                      className={cn("absolute inset-0 size-full -scale-x-100 object-cover", !live && "invisible")}
                    />
                    {!live && (
                      <div className="absolute inset-0 grid place-items-center text-text-tertiary">
                        <HugeiconsIcon icon={UserIcon} size={56} strokeWidth={1.2} />
                      </div>
                    )}
                    {camera.status === "live" && (
                      <div className="pointer-events-none absolute inset-[14%] rounded-[50%] border-2 border-dashed border-white/70" />
                    )}
                  </>
                )}
              </div>
              {showResult && upload.status !== "error" && !busy && (
                <span className="absolute right-4 bottom-4 grid size-9 animate-pop place-items-center rounded-full bg-success text-white ring-4 ring-canvas">
                  <HugeiconsIcon icon={Tick02Icon} size={18} strokeWidth={2.6} />
                </span>
              )}
            </div>

            <p className="max-w-xs text-center text-xs text-text-tertiary" aria-live="polite">
              {busy
                ? `Uploading… ${upload.progress}%`
                : camera.status === "live"
                  ? "Centre your face in the oval, with good lighting and no hat or glasses."
                  : showResult
                    ? "Looking good. You can retake it if it's blurry."
                    : "Your camera is only used for this photo."}
            </p>

            {upload.status === "error" && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-danger">
                <HugeiconsIcon icon={Alert02Icon} size={14} /> {upload.error}
              </p>
            )}
            {cameraBlocked && !showResult && (
              <p className="max-w-sm rounded-xl bg-warning-surface px-3 py-2 text-center text-xs text-warning">
                {camera.status === "denied"
                  ? "Camera access was blocked. Upload a selfie instead, or allow camera access in your browser settings."
                  : "We couldn't open a camera on this device. Upload a selfie instead."}
              </p>
            )}

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {showResult ? (
                <Button type="button" variant="outline" size="lg" onClick={retake} disabled={busy}>
                  <HugeiconsIcon icon={RefreshIcon} size={16} /> Retake
                </Button>
              ) : camera.status === "live" ? (
                <Button type="button" size="lg" variant="brand" onClick={takePhoto}>
                  <HugeiconsIcon icon={Camera01Icon} size={16} /> Take photo
                </Button>
              ) : (
                !cameraBlocked && (
                  <Button type="button" size="lg" onClick={camera.start} isLoading={camera.status === "starting"}>
                    <HugeiconsIcon icon={Camera01Icon} size={16} /> Open camera
                  </Button>
                )
              )}
              {!showResult && (
                <Button type="button" variant="ghost" size="lg" onClick={() => fileInputRef.current?.click()}>
                  <HugeiconsIcon icon={Upload04Icon} size={16} /> Upload a photo instead
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="user"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) submitFile(file)
                e.target.value = ""
              }}
            />
            <FormMessage className={FIELD_MESSAGE} />
          </FormItem>
        )}
      />
    </div>
  )
}
