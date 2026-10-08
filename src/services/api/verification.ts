import { apiClient, type Envelope } from "@/lib/axios"
import type { Verification, VerificationPayload } from "@/types/verification"

export async function fetchVerification(slug: string): Promise<Verification> {
  const { data } = await apiClient.get<Envelope<Verification>>(`/workspaces/${slug}/verification`)
  return data.data
}

export async function submitVerification(slug: string, payload: VerificationPayload): Promise<Verification> {
  const { data } = await apiClient.post<Envelope<Verification>>(`/workspaces/${slug}/verification`, payload)
  return data.data
}
