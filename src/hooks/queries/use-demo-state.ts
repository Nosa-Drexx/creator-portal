"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchDemoState } from "@/services/api/demo"

export const DEMO_QUERY_KEY = ["demo"] as const

export function useDemoState() {
  return useQuery({ queryKey: [...DEMO_QUERY_KEY], queryFn: fetchDemoState })
}
