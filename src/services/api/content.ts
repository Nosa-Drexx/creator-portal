import { apiClient, type Envelope } from "@/lib/axios"
import type { Content, ContentListParams, ContentPayload } from "@/types/content"

const base = (slug: string) => `/workspaces/${slug}/content`

export async function fetchContentList(slug: string, params?: ContentListParams): Promise<Content[]> {
  const { data } = await apiClient.get<Envelope<Content[]>>(base(slug), { params })
  return data.data
}

export async function fetchContent(slug: string, id: string): Promise<Content> {
  const { data } = await apiClient.get<Envelope<Content>>(`${base(slug)}/${id}`)
  return data.data
}

export async function createContent(slug: string, payload: ContentPayload): Promise<Content> {
  const { data } = await apiClient.post<Envelope<Content>>(base(slug), payload)
  return data.data
}

export async function updateContent(slug: string, id: string, payload: ContentPayload): Promise<Content> {
  const { data } = await apiClient.put<Envelope<Content>>(`${base(slug)}/${id}`, payload)
  return data.data
}

export async function deleteContent(slug: string, id: string): Promise<void> {
  await apiClient.delete(`${base(slug)}/${id}`)
}
