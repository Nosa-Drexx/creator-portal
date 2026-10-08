"use client"

import { useEffect } from "react"
import { useWorkspace } from "@/hooks/queries/use-workspace"

/** Applies the tenant's accent to the whole document, including portalled dialogs */
export function WorkspaceBrand() {
  const { data } = useWorkspace()
  useEffect(() => {
    if (data) document.documentElement.style.setProperty("--brand", data.accentColor)
  }, [data])
  return null
}
