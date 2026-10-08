import { useSyncExternalStore } from "react"

const MOBILE_QUERY = "(max-width: 767px)"
/** Phones and portrait tablets: too narrow for wide data tables */
const COMPACT_QUERY = "(max-width: 1023px)"

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const useIsMobile = () => useMediaQuery(MOBILE_QUERY)

export const useIsCompact = () => useMediaQuery(COMPACT_QUERY)
