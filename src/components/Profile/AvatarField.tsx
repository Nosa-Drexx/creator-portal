"use client"

import { useRef } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Camera01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { useAvatarMutations } from "@/hooks/mutations/use-profile-mutations"
import { customToast } from "@/hooks/use-toast"
import { toSquareAvatar } from "@/lib/image"
import { AVATAR_TYPES } from "@/lib/validation/profile"
import type { User } from "@/types/workspace"

export function AvatarField({ user }: { user: User }) {
  const input = useRef<HTMLInputElement>(null)
  const { upload, remove } = useAvatarMutations()
  const busy = upload.isPending || remove.isPending

  const onFile = async (file?: File) => {
    if (!file) return
    if (!AVATAR_TYPES.includes(file.type)) return customToast("error", "Use a JPG, PNG or WebP image")
    try {
      upload.mutate(await toSquareAvatar(file))
    } catch {
      customToast("error", "We couldn't read that image")
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        aria-label="Change profile photo"
        className="group relative size-20 shrink-0 overflow-hidden rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className="size-20 text-xl" />
        <span className="absolute inset-0 grid place-items-center bg-black/45 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          {busy ? <Spinner className="size-5" /> : <HugeiconsIcon icon={Camera01Icon} size={20} />}
        </span>
      </button>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()} isLoading={upload.isPending}>
            Upload photo
          </Button>
          {user.avatarUrl && (
            <Button type="button" variant="ghost" size="sm" onClick={() => remove.mutate()} isLoading={remove.isPending}>
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
