"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchOptionalSession, fetchSession } from "@/services/api/session"

export const SESSION_QUERY_KEY = ["session"] as const

export function useSession() {
  return useQuery({ queryKey: [...SESSION_QUERY_KEY], queryFn: fetchSession, staleTime: 60_000 })
}

export function useOptionalSession() {
  return useQuery({ queryKey: [...SESSION_QUERY_KEY, "optional"], queryFn: fetchOptionalSession, staleTime: 60_000 })
}
