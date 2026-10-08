"use client"

import { useEffect, useState } from "react"

/** Local blob URL for instant previews; revoked when the file changes */
export function useObjectUrl(file: File | Blob | null) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    const next = file ? URL.createObjectURL(file) : null
    // Syncing with an external resource; creating it in render would leak under Strict Mode
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(next)
    return () => {
      if (next) URL.revokeObjectURL(next)
    }
  }, [file])
  return url
}
