"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { customToast } from "@/hooks/use-toast"
import { getApiErrorMessage } from "@/lib/axios"
import { logIn, logOut, signUp } from "@/services/api/auth"

/** Only same-site relative paths, so a crafted ?next= can't redirect off-site */
export function safeNextPath(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/"
}

export function useLogIn(next: string | null) {
  const router = useRouter()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logIn,
    onSuccess: () => {
      queryClient.clear()
      router.replace(safeNextPath(next))
    },
  })
}

export function useSignUp() {
  const router = useRouter()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: signUp,
    onSuccess: () => {
      queryClient.clear()
      router.replace("/onboarding")
    },
  })
}

export function useLogOut() {
  const router = useRouter()
  return useMutation({
    mutationFn: logOut,
    // Cache is cleared on the next login; clearing now would refetch mounted queries into 401s
    onSuccess: () => router.replace("/login"),
    onError: (error) => customToast("error", getApiErrorMessage(error, "We couldn't log you out. Please try again.")),
  })
}
