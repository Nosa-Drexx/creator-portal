"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { SESSION_QUERY_KEY } from "@/hooks/queries/use-session"
import { customToast } from "@/hooks/use-toast"
import { changePassword, removeAvatar, updateProfile, uploadAvatar } from "@/services/api/me"

function useRefreshSession() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: [...SESSION_QUERY_KEY] })
}

/** A newly picked photo, "remove", or null for no change */
export type PhotoChange = Blob | "remove" | null

/** One Save for the whole profile card: photo first, then the name */
export function useSaveProfile() {
  const refresh = useRefreshSession()
  return useMutation({
    mutationFn: async ({ name, photo }: { name?: string; photo: PhotoChange }) => {
      if (photo === "remove") await removeAvatar()
      else if (photo) await uploadAvatar(photo)
      if (name !== undefined) await updateProfile({ name })
    },
    // Awaited so the staged preview is only dropped once the saved photo is in the session
    onSuccess: async () => {
      await refresh()
      customToast("success", "Profile updated")
    },
    // The photo may have saved even if the name didn't
    onError: () => refresh(),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => customToast("success", "Password changed. Other devices have been signed out."),
  })
}
