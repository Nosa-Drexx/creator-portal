"use client"

import { useCallback, useEffect, useRef } from "react"

export function useDebouncedCallback<A extends unknown[]>(callback: (...args: A) => void, delay = 300) {
  const callbackRef = useRef(callback)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const debounced = useCallback(
    (...args: A) => {
      cancel()
      timer.current = setTimeout(() => callbackRef.current(...args), delay)
    },
    [cancel, delay],
  )

  return { debounced, cancel }
}
