"use client"

import { Suspense } from "react"
import { useHydrated } from "@/hooks/use-hydrated"

interface ClientBoundaryProps {
  fallback: React.ReactNode
  children: React.ReactNode
}

function HydrationGate({ fallback, children }: ClientBoundaryProps) {
  return useHydrated() ? <>{children}</> : <>{fallback}</>
}

/**
 * For client-fetched trees: server and hydration both render the fallback, so
 * cached query data from a sibling boundary can never cause a mismatch.
 */
export function ClientBoundary({ fallback, children }: ClientBoundaryProps) {
  return (
    <Suspense fallback={fallback}>
      <HydrationGate fallback={fallback}>{children}</HydrationGate>
    </Suspense>
  )
}
