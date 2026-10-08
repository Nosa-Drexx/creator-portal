"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { EDemoFault } from "@/constants/demo"
import type { EVerificationStatus } from "@/enums/verification"
import { customToast } from "@/hooks/use-toast"
import { getApiErrorMessage } from "@/lib/axios"
import { resetDemo, setDemoFault, setDemoVerification } from "@/services/api/demo"

function useRefreshEverything() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries()
}

export function useResetDemo() {
  const refresh = useRefreshEverything()
  return useMutation({
    mutationFn: resetDemo,
    onSuccess: () => {
      refresh()
      customToast("success", "Demo data has been reset.")
    },
    onError: (error) => customToast("error", getApiErrorMessage(error, "Reset failed.")),
  })
}

export function useSetDemoFault() {
  const refresh = useRefreshEverything()
  return useMutation({
    mutationFn: (value: EDemoFault) => setDemoFault(value),
    onSuccess: () => refresh(),
  })
}

export function useSetDemoVerification() {
  const refresh = useRefreshEverything()
  return useMutation({
    mutationFn: ({ workspace, status }: { workspace: string; status: EVerificationStatus }) =>
      setDemoVerification(workspace, status),
    onSuccess: () => refresh(),
    onError: (error) => customToast("error", getApiErrorMessage(error, "Could not change verification.")),
  })
}
