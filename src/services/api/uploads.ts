import { apiClient, type Envelope } from "@/lib/axios"
import type { UploadIntent, UploadIntentPayload } from "@/types/uploads"

export async function createUploadIntent(slug: string, payload: UploadIntentPayload): Promise<UploadIntent> {
  const { data } = await apiClient.post<Envelope<UploadIntent>>(`/workspaces/${slug}/uploads`, payload)
  return data.data
}

export async function signMediaKeys(slug: string, keys: string[]) {
  const { data } = await apiClient.post<Envelope<{ urls: Record<string, string>; ttlSeconds: number }>>(
    `/workspaces/${slug}/media/sign`,
    { keys },
  )
  return data.data
}
