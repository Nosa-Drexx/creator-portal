"use client"

import { useEffect, useState } from "react"

/** Seconds remaining until `target`, ticking every second */
export function useCountdown(target: string | null) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!target) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [target])

  if (!target) return null
  return Math.max(0, Math.ceil((new Date(target).getTime() - now) / 1000))
}
