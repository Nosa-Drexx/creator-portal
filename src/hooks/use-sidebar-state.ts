"use client"

import { useCallback, useSyncExternalStore } from "react"

const STORAGE_KEY = "ch:sidebar"
const EVENT = "ch:sidebar-change"
const TABLET = "(min-width: 768px) and (max-width: 1023px)"

type Preference = "collapsed" | "expanded" | null

function readPreference(): Preference {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === "collapsed" || value === "expanded" ? value : null
  } catch {
    return null
  }
}

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(TABLET)
  mql.addEventListener("change", onChange)
  window.addEventListener(EVENT, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    mql.removeEventListener("change", onChange)
    window.removeEventListener(EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

/** Collapsed by default on tablets; an explicit choice is remembered */
function getSnapshot() {
  const preference = readPreference()
  return preference ? preference === "collapsed" : window.matchMedia(TABLET).matches
}

export function useSidebarState() {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, () => false)

  const toggle = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, getSnapshot() ? "expanded" : "collapsed")
    } catch {}
    window.dispatchEvent(new Event(EVENT))
  }, [])

  return { collapsed, toggle }
}
