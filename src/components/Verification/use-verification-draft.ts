"use client"

import { useCallback, useMemo } from "react"
import type { VerificationFormValues } from "@/lib/validation/verification"

interface Draft {
  values: Partial<VerificationFormValues>
  step: number
}

const keyFor = (slug: string) => `creatorhub:verification-draft:${slug}`

/** Keeps wizard progress across refreshes (session only; uploaded files are referenced by key) */
export function useVerificationDraft(slug: string) {
  const key = keyFor(slug)

  const initial = useMemo<Draft | null>(() => {
    try {
      const raw = sessionStorage.getItem(key)
      return raw ? (JSON.parse(raw) as Draft) : null
    } catch {
      return null
    }
  }, [key])

  const save = useCallback(
    (draft: Draft) => {
      try {
        sessionStorage.setItem(key, JSON.stringify(draft))
      } catch {}
    },
    [key],
  )

  const clear = useCallback(() => {
    try {
      sessionStorage.removeItem(key)
    } catch {}
  }, [key])

  return { initial, save, clear }
}
