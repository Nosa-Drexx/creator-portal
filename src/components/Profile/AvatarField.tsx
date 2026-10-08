"use client"

import { useRef } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Camera01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { customToast } from "@/hooks/use-toast"
import { toSquareAvatar } from "@/lib/image"
import { AVATAR_TYPES } from "@/lib/validation/profile"

interface AvatarFieldProps {
  name: string
  /** What the avatar shows now: the saved photo, a staged preview, or null */
  avatarUrl: string | null
  disabled?: boolean
  onPick: (image: Blob) => void
  onRemove: () => void
}

/** Stages a photo; the profile form's Save applies it */
export function AvatarField({ name, avatarUrl, disabled, onPick, onRemove }: AvatarFieldProps) {
  const input = useRef<HTMLInputElement>(null)

  const onFile = async (file?: File) => {
    if (!file) return
    if (!AVATAR_TYPES.includes(file.type)) return customToast("error", "Use a JPG, PNG or WebP image")
    try {
      onPick(await toSquareAvatar(file))
    } catch {
      customToast("error", "We couldn't read that image")
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={disabled}
        aria-label="Change profile photo"
        className="group relative size-20 shrink-0 overflow-hidden rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <UserAvatar name={name} avatarUrl={avatarUrl} className="size-20 text-xl" />
        <span className="absolute inset-0 grid place-items-center bg-black/45 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          <HugeiconsIcon icon={Camera01Icon} size={20} />
        </span>
      </button>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()} disabled={disabled}>
            {avatarUrl ? "Change photo" : "Upload photo"}
          </Button>
          {avatarUrl && (
            <Button type="button" variant="ghost" size="sm" onClick={onRemove} disabled={disabled}>
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-text-tertiary">Square images work best. We crop and resize it for you.</p>
      </div>
      <input
        ref={input}
        type="file"
        accept={AVATAR_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => {
          void onFile(e.target.files?.[0])
          e.target.value = ""
        }}
      />
    </div>
  )
}
