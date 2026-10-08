import { apiClient, type Envelope } from "@/lib/axios"
import type { UploadIntent, UploadIntentPayload } from "@/types/uploads"

export async function createUploadIntent(slug: string, payload: UploadIntentPayload): Promise<UploadIntent> {
  const { data } = await apiClient.post<Envelope<UploadIntent>>(`/workspaces/${slug}/uploads`, payload)
  return data.data
}

/** Confirms a finished PUT so the key can be attached to content or verification */
export async function completeUpload(slug: string, key: string) {
  await apiClient.post(`/workspaces/${slug}/uploads/complete`, { key })
}

export async function signMediaKeys(slug: string, keys: string[]) {
  const { data } = await apiClient.post<Envelope<{ urls: Record<string, string>; ttlSeconds: number }>>(
    `/workspaces/${slug}/media/sign`,
    { keys },
  )
  return data.data
}
