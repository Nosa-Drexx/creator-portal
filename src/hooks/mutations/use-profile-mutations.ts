"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { SESSION_QUERY_KEY } from "@/hooks/queries/use-session"
import { customToast } from "@/hooks/use-toast"
import { getApiErrorMessage } from "@/lib/axios"
import { changePassword, removeAvatar, updateProfile, uploadAvatar } from "@/services/api/me"

function useRefreshSession() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: [...SESSION_QUERY_KEY] })
}

export function useUpdateProfile() {
  const refresh = useRefreshSession()
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      refresh()
      customToast("success", "Profile updated")
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => customToast("success", "Password changed. Other devices have been signed out."),
  })
}

export function useAvatarMutations() {
  const refresh = useRefreshSession()
  const onError = (error: unknown) => customToast("error", getApiErrorMessage(error, "We couldn't update your photo."))
  const upload = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      refresh()
      customToast("success", "Profile photo updated")
    },
    onError,
  })
  const remove = useMutation({ mutationFn: removeAvatar, onSuccess: () => refresh(), onError })
  return { upload, remove }
}
